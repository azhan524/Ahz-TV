'use strict';

const {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  nativeTheme,
  session,
  shell
} = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const QRCode = require('qrcode');
const { getUrlProtocol, isWebUrl } = require('./navigation');
const { startPhoneCast, stopPhoneCast } = require('./phone-cast');

const APP_NAME = 'Ahz TV';
const APP_ID = 'com.local.ahz.tv';
const SHELL_FILE = path.join(__dirname, 'renderer', 'index.html');
const PRELOAD_FILE = path.join(__dirname, 'preload.js');
const SMOKE_TEST = process.argv.includes('--smoke-test');
const SMOKE_URL = process.argv.find((argument) => argument.startsWith('--smoke-url='))?.slice(12);
const SMOKE_PLUGIN_KEY = process.argv
  .find((argument) => argument.startsWith('--smoke-plugin-key='))?.slice(19)
  .replace(/[^a-z0-9_-]/gi, '');
const SMOKE_VIDEO_PATH = process.argv
  .find((argument) => argument.startsWith('--smoke-video='))?.slice(14);
const SMOKE_TRIGGER_PROTOCOL = process.argv
  .find((argument) => argument.startsWith('--smoke-trigger-protocol='))
  ?.split('=')[1]
  ?.replace(/[^a-z0-9+.-]/gi, '');
const SMOKE_PHONE_CAST = process.argv.includes('--smoke-phone-cast');
const SMOKE_PHONE_UPLOAD = process.argv.includes('--smoke-phone-upload');
const SMOKE_AIRPLAY_EXTENSION = process.argv.includes('--smoke-airplay-extension');
const SMOKE_CAPTURE_AIRPLAY = process.argv.includes('--smoke-capture-airplay');
const SMOKE_CLICK_PLAY = process.argv.includes('--smoke-click-play');
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const WINDOW_STATE_FILE = () => path.join(app.getPath('userData'), 'window-state.json');

let mainWindow = null;
let smokeFinished = false;
let airplayExtensionProcess = null;
let lastBlockedProtocol = '';
let lastBlockedProtocolAt = 0;
const securedGuestSessions = new WeakSet();

function sendToMainWindow(channel, ...args) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send(channel, ...args);
}

function describeLocalVideo(filePath) {
  const fileStats = fs.statSync(filePath);
  return {
    name: path.basename(filePath),
    path: filePath,
    url: pathToFileURL(filePath).href,
    size: fileStats.size,
    modifiedAt: fileStats.mtimeMs
  };
}

function airplayExtensionDirectory() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'ahz-stream')
    : path.join(__dirname, '..', 'vendor', 'airplay-windows');
}

function airplayExtensionExecutable() {
  return path.join(airplayExtensionDirectory(), 'airplay-windows.exe');
}

function setIniValue(contents, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(contents)) {
    return contents.replace(pattern, `${key}=${value}`);
  }
  return `${contents.replace(/\s*$/, '')}\n${key}=${value}\n`;
}

function ensureAirplayStreamDefaults() {
  const settingsDirectory = path.join(app.getPath('appData'), 'AirPlay-Windows');
  const settingsPath = path.join(settingsDirectory, 'settings.ini');
  fs.mkdirSync(settingsDirectory, { recursive: true });

  let settings = fs.existsSync(settingsPath)
    ? fs.readFileSync(settingsPath, 'utf8')
    : '';
  const currentName = settings.match(/^receiver_name=(.*)$/m)?.[1]?.trim();
  if (!currentName || currentName === 'AirPlay-Windows') {
    settings = setIniValue(settings, 'receiver_name', 'Ahz-Stream');
  }

  const qualityDefaults = {
    mirror_width: '3840',
    mirror_height: '2160',
    hevc_enabled: '1',
    hls_playback: '0',
    max_fps: '60',
    refresh_rate: '60',
    mirror_hwaccel: '1',
    vsync_enabled: '1',
    fullscreen: '0',
    chromeless: '0',
    video_rotation: '-1',
    language: 'en',
    dark_theme: '0',
    diagnostics: '0'
  };
  for (const [key, value] of Object.entries(qualityDefaults)) {
    if (!new RegExp(`^${key}=`, 'm').test(settings)) {
      settings = setIniValue(settings, key, value);
    }
  }
  fs.writeFileSync(settingsPath, settings, 'utf8');
}

function airplayExtensionStatus() {
  const available = fs.existsSync(airplayExtensionExecutable());
  const running = Boolean(airplayExtensionProcess && airplayExtensionProcess.exitCode === null);
  return {
    available,
    running,
    pid: running ? airplayExtensionProcess.pid : null,
    receiverName: 'Ahz-Stream'
  };
}

function sendAirplayExtensionStatus() {
  sendToMainWindow('airplay:status', airplayExtensionStatus());
}

function startAirplayExtension() {
  if (airplayExtensionProcess && airplayExtensionProcess.exitCode === null) {
    return airplayExtensionStatus();
  }

  const executable = airplayExtensionExecutable();
  if (!fs.existsSync(executable)) {
    throw new Error('内置 Ahz-Stream 接收器文件缺失');
  }

  ensureAirplayStreamDefaults();
  airplayExtensionProcess = spawn(executable, [], {
    cwd: airplayExtensionDirectory(),
    windowsHide: false,
    detached: false,
    stdio: 'ignore'
  });

  airplayExtensionProcess.once('error', () => {
    airplayExtensionProcess = null;
    sendAirplayExtensionStatus();
  });
  airplayExtensionProcess.once('exit', () => {
    airplayExtensionProcess = null;
    sendAirplayExtensionStatus();
  });

  sendAirplayExtensionStatus();
  return airplayExtensionStatus();
}

function stopAirplayExtension() {
  if (airplayExtensionProcess && airplayExtensionProcess.exitCode === null) {
    airplayExtensionProcess.kill();
  }
  airplayExtensionProcess = null;
  sendAirplayExtensionStatus();
  return true;
}

app.setName(APP_NAME);
app.setAppUserModelId(APP_ID);

app.userAgentFallback = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/136.0.0.0 Safari/537.36'
].join(' ');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function readWindowState() {
  try {
    const state = JSON.parse(fs.readFileSync(WINDOW_STATE_FILE(), 'utf8'));
    if (
      Number.isFinite(state.width) &&
      Number.isFinite(state.height) &&
      state.width >= 900 &&
      state.height >= 600
    ) {
      return state;
    }
  } catch {
    // First run or invalid state: use the defaults below.
  }
  return { width: 1360, height: 860, x: undefined, y: undefined };
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const bounds = mainWindow.getNormalBounds();
  try {
    fs.writeFileSync(
      WINDOW_STATE_FILE(),
      JSON.stringify({ width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y }),
      'utf8'
    );
  } catch {
    // Window state is a convenience; failure must never block shutdown.
  }
}

function sendWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  sendToMainWindow('window:state', {
    isMaximized: mainWindow.isMaximized(),
    isFullScreen: mainWindow.isFullScreen()
  });
}

function handleWindowAction(action) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
    case 'toggle-fullscreen':
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      break;
    default:
      throw new Error(`Unknown window action: ${action}`);
  }
}

async function finishSmokeTest(success, message, guest = null) {
  if (!SMOKE_TEST || smokeFinished) {
    return;
  }
  smokeFinished = true;

  let playResult = null;
  if (SMOKE_CLICK_PLAY && guest && !guest.isDestroyed()) {
    try {
      for (let attempt = 0; attempt < 12 && !playResult?.clicked; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        playResult = await guest.executeJavaScript(`
          (() => {
            const target = [...document.querySelectorAll('button, a')]
              .find((node) => /播放正片|立即播放/.test(node.textContent || ''));
            if (!target) return { clicked: false };
            target.click();
            return {
              clicked: true,
              text: target.textContent.trim(),
              href: target.href || ''
            };
          })()
        `);
      }
      if (playResult?.clicked) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }
    } catch (error) {
      playResult = { clicked: false, error: error.message };
    }
  }

  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
      const screenshot = await mainWindow.capturePage();
      const filename = SMOKE_CLICK_PLAY ? 'smoke-play.png' : 'smoke-test.png';
      fs.writeFileSync(path.join(ARTIFACTS_DIR, filename), screenshot.toPNG());
    }
  } catch (error) {
    console.error(`[smoke] screenshot failed: ${error.message}`);
  }

  const details = {
    success,
    message,
    url: guest && !guest.isDestroyed() ? guest.getURL() : null,
    title: guest && !guest.isDestroyed() ? guest.getTitle() : null,
    blockedProtocol: lastBlockedProtocol || null,
    playResult
  };
  try {
    details.shell = await mainWindow.webContents.executeJavaScript(`
      ({
        active: [...document.querySelectorAll('.is-active')].map((node) => node.dataset.navKey || node.id),
        contextTitle: document.querySelector('#pageTitle')?.textContent || '',
        loadState: document.querySelector('#loadState')?.textContent || '',
        toast: document.querySelector('#toast')?.textContent || '',
        phoneCastOpen: !document.querySelector('#phoneCastDialog')?.hidden,
        phoneCastState: document.querySelector('#phoneCastState')?.textContent || '',
        phoneCastQrReady: document.querySelector('#phoneCastQr')?.src?.startsWith('data:image/') || false,
        airplayExtensionState: document.querySelector('#airplayExtensionState')?.textContent || '',
        castImageVisible: !document.querySelector('#castImageView')?.hidden,
        castImageReady: document.querySelector('#castImage')?.src?.startsWith('file:') || false,
        projectionVisible: !document.querySelector('#projectionView')?.hidden,
        projectionStreamActive: Boolean(document.querySelector('#projectionVideo')?.srcObject),
        playerHidden: document.querySelector('#playerView')?.hidden ?? null,
        videoState: (() => {
          const video = document.querySelector('#localVideo');
          if (!video || !video.src) return null;
          return {
            paused: video.paused,
            readyState: video.readyState,
            currentTime: Number(video.currentTime.toFixed(2)),
            duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
            error: video.error ? video.error.code : null
          };
        })()
      })
    `);
  } catch (error) {
    details.shell = { error: error.message };
  }
  try {
    if (guest && !guest.isDestroyed()) {
      details.guest = await guest.executeJavaScript(`
        ({
          href: location.href,
          title: document.title,
          videos: document.querySelectorAll('video').length,
          videoState: (() => {
            const video = document.querySelector('video');
            if (!video) return null;
            return {
              paused: video.paused,
              readyState: video.readyState,
              networkState: video.networkState,
              currentTime: Number(video.currentTime.toFixed(2)),
              duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
              error: video.error ? video.error.code : null
            };
          })(),
          playButtons: [...document.querySelectorAll('button, a')]
            .filter((node) => /播放正片|立即播放/.test(node.textContent || ''))
            .length
        })
      `);
    }
  } catch (error) {
    details.guest = { error: error.message };
  }
  console.log(`[smoke] ${JSON.stringify(details)}`);

  setTimeout(() => {
    app.exit(success ? 0 : 1);
  }, 250);
}

function configurePermissions() {
  const allowedPermissions = new Set(['fullscreen', 'display-capture', 'media']);

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(allowedPermissions.has(permission));
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return allowedPermissions.has(permission);
  });

  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    const frameUrl = request.frame?.url || '';
    if ((!request.userGesture && !SMOKE_CAPTURE_AIRPLAY) || !frameUrl.startsWith('file:')) {
      callback({});
      return;
    }

    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 0, height: 0 },
      fetchWindowIcons: false
    });
    const source = sources.find((item) =>
      /ahz[\s-]*stream|无线|投屏|投影|手机|connect|wireless|project|airserver|airplay|uxplay|reflector|letsview|apowermirror|5kplayer|lonelyscreen|mirror|cast/i
        .test(item.name)
    );

    callback(source ? { video: { id: source.id, name: source.name } } : {});
  }, { useSystemPicker: false });
}

function notifyBlockedProtocol(url) {
  const protocol = getUrlProtocol(url);
  const now = Date.now();
  if (!protocol || (protocol === lastBlockedProtocol && now - lastBlockedProtocolAt < 1500)) {
    return;
  }

  lastBlockedProtocol = protocol;
  lastBlockedProtocolAt = now;
  if (mainWindow && !mainWindow.isDestroyed()) {
    sendToMainWindow('guest:blocked-protocol', { protocol });
  }
}

function preventExternalProtocol(event, url) {
  if (isWebUrl(url)) {
    return false;
  }
  event.preventDefault();
  notifyBlockedProtocol(url);
  return true;
}

function secureGuestSession(guest) {
  const guestSession = guest.session;
  if (securedGuestSessions.has(guestSession)) {
    return;
  }
  securedGuestSessions.add(guestSession);

  const allowedSchemes = new Set([
    'http:',
    'https:',
    'ws:',
    'wss:',
    'blob:',
    'data:',
    'file:',
    'about:'
  ]);

  guestSession.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    let protocol = '';
    try {
      protocol = new URL(details.url).protocol;
    } catch {
      callback({ cancel: true });
      return;
    }

    if (!allowedSchemes.has(protocol)) {
      notifyBlockedProtocol(details.url);
      callback({ cancel: true });
      return;
    }
    callback({});
  });
}

function configureGuestWindow(guest) {
  secureGuestSession(guest);

  guest.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        sendToMainWindow('guest:open-url', url);
      }
    } else {
      notifyBlockedProtocol(url);
    }
    return { action: 'deny' };
  });

  guest.on('will-navigate', (event) => {
    preventExternalProtocol(event, event.url);
  });

  guest.on('will-frame-navigate', (event) => {
    preventExternalProtocol(event, event.url);
  });

  guest.on('will-redirect', (event) => {
    preventExternalProtocol(event, event.url);
  });

  guest.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') {
      return;
    }

    if (input.key === 'F11') {
      event.preventDefault();
      handleWindowAction('toggle-fullscreen');
    } else if (input.key === 'Escape' && mainWindow?.isFullScreen()) {
      event.preventDefault();
      handleWindowAction('toggle-fullscreen');
    } else if (input.control && input.key.toLowerCase() === 'k') {
      event.preventDefault();
      sendToMainWindow('shortcut:focus-search');
    }
  });

  if (SMOKE_TEST && SMOKE_URL) {
    let targetRequested = false;
    guest.once('dom-ready', () => {
      targetRequested = true;
      guest.loadURL(SMOKE_URL);
    });
    guest.on('did-finish-load', () => {
      if (targetRequested && guest.getURL().startsWith(SMOKE_URL)) {
        finishSmokeTest(true, 'remote page loaded', guest);
      }
    });
    guest.once('did-fail-load', (_event, errorCode, errorDescription, _url, isMainFrame) => {
      if (isMainFrame && errorCode !== -3) {
        finishSmokeTest(false, `${errorCode}: ${errorDescription}`, guest);
      }
    });
  } else if (SMOKE_TEST && SMOKE_PLUGIN_KEY) {
    let protocolTriggered = false;
    guest.on('did-finish-load', async () => {
      const url = guest.getURL();
      if (!isWebUrl(url)) {
        return;
      }

      if (SMOKE_TRIGGER_PROTOCOL && !protocolTriggered) {
        protocolTriggered = true;
        await new Promise((resolve) => setTimeout(resolve, 300));
        await guest.executeJavaScript(`
          (() => {
            const link = document.createElement('a');
            link.href = ${JSON.stringify(`${SMOKE_TRIGGER_PROTOCOL}://ahz-tv-test`)};
            link.textContent = 'Ahz TV protocol test';
            document.body.appendChild(link);
            link.click();
            link.remove();
            return true;
          })()
        `);
        await new Promise((resolve) => setTimeout(resolve, 900));
        finishSmokeTest(
          lastBlockedProtocol === SMOKE_TRIGGER_PROTOCOL,
          lastBlockedProtocol ? 'external protocol blocked' : 'external protocol not observed',
          guest
        );
      } else if (!SMOKE_TRIGGER_PROTOCOL) {
        finishSmokeTest(true, 'plugin page loaded', guest);
      }
    });
  }
  if (SMOKE_TEST && (SMOKE_URL || SMOKE_PLUGIN_KEY)) {
    guest.once('did-fail-load', (_event, errorCode, errorDescription, _url, isMainFrame) => {
      if (isMainFrame && errorCode !== -3) {
        finishSmokeTest(false, `${errorCode}: ${errorDescription}`, guest);
      }
    });
  }
}

function createWindow() {
  const state = readWindowState();
  mainWindow = new BrowserWindow({
    ...state,
    minWidth: 920,
    minHeight: 620,
    show: false,
    frame: false,
    title: APP_NAME,
    backgroundColor: '#0a0b0e',
    autoHideMenuBar: true,
    webPreferences: {
      preload: PRELOAD_FILE,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') {
      return;
    }

    if (input.key === 'F11') {
      event.preventDefault();
      handleWindowAction('toggle-fullscreen');
    } else if (input.key === 'Escape' && mainWindow?.isFullScreen()) {
      event.preventDefault();
      handleWindowAction('toggle-fullscreen');
    } else if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      event.preventDefault();
      sendToMainWindow('shortcut:reload');
    } else if (input.control && input.key.toLowerCase() === 'k') {
      event.preventDefault();
      sendToMainWindow('shortcut:focus-search');
    }
  });

  mainWindow.webContents.on('will-attach-webview', (_event, webPreferences) => {
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.nodeIntegrationInSubFrames = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
  });

  mainWindow.webContents.on('did-attach-webview', (_event, guest) => {
    configureGuestWindow(guest);
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  if (SMOKE_TEST && SMOKE_PHONE_CAST) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        await mainWindow.webContents.executeJavaScript(
          "document.querySelector('#openPhoneCast').click()"
        );
      }, 350);
      if (SMOKE_CAPTURE_AIRPLAY) {
        setTimeout(async () => {
          await mainWindow.webContents.executeJavaScript(
            "document.querySelector('#connectProjectionWindow').click()"
          );
        }, 1300);
        setTimeout(() => finishSmokeTest(true, 'airplay window captured'), 4300);
      } else if (SMOKE_AIRPLAY_EXTENSION) {
        setTimeout(async () => {
          await mainWindow.webContents.executeJavaScript(
            "document.querySelector('#startAirplayExtension').click()"
          );
        }, 1200);
        setTimeout(() => finishSmokeTest(true, 'airplay extension started'), 4300);
      } else if (SMOKE_PHONE_UPLOAD) {
        setTimeout(async () => {
          try {
            const info = await startPhoneCast({});
            const iconPath = path.join(process.cwd(), 'build', 'icon.png');
            const png = fs.existsSync(iconPath)
              ? fs.readFileSync(iconPath)
              : Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
                'base64'
              );
            const response = await fetch(
              `http://127.0.0.1:${info.port}/api/upload?token=${info.token}&name=smoke-photo.png&type=image%2Fpng`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: png
              }
            );
            if (!response.ok) {
              throw new Error(`upload failed: ${response.status}`);
            }
          } catch (error) {
            console.error(`[smoke] phone upload failed: ${error.message}`);
          }
        }, 1400);
        setTimeout(() => finishSmokeTest(true, 'phone media received'), 3600);
      } else {
        setTimeout(() => finishSmokeTest(true, 'phone cast dialog opened'), 3200);
      }
    });
  } else if (SMOKE_TEST && SMOKE_VIDEO_PATH) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => finishSmokeTest(true, 'local video loaded'), 4800);
    });
  } else if (SMOKE_TEST && !SMOKE_URL && !SMOKE_PLUGIN_KEY) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => finishSmokeTest(true, 'local home loaded'), 500);
    });
  } else if (SMOKE_TEST && SMOKE_PLUGIN_KEY) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        await mainWindow.webContents.executeJavaScript(`
          (() => {
            const button = document.querySelector(
              '[data-plugin-key="${SMOKE_PLUGIN_KEY}"][data-url]'
            );
            if (button) button.click();
            return Boolean(button);
          })()
        `);
      }, 500);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    sendWindowState();
  });

  mainWindow.on('maximize', sendWindowState);
  mainWindow.on('unmaximize', sendWindowState);
  mainWindow.on('enter-full-screen', sendWindowState);
  mainWindow.on('leave-full-screen', sendWindowState);
  mainWindow.on('close', saveWindowState);

  mainWindow.loadFile(SHELL_FILE);
}

ipcMain.handle('window:action', (_event, action) => {
  handleWindowAction(action);
  return { isMaximized: mainWindow?.isMaximized() ?? false };
});

ipcMain.handle('window:get-state', () => ({
  isMaximized: mainWindow?.isMaximized() ?? false,
  isFullScreen: mainWindow?.isFullScreen() ?? false,
  version: app.getVersion(),
  platform: process.platform,
  smokeVideo: SMOKE_VIDEO_PATH && fs.existsSync(SMOKE_VIDEO_PATH)
    ? describeLocalVideo(SMOKE_VIDEO_PATH)
    : null
}));

ipcMain.handle('desktop:open-external', async (_event, url) => {
  if (!isWebUrl(url)) {
    return false;
  }
  await shell.openExternal(url);
  return true;
});

ipcMain.handle('media:pick-video', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '在 Ahz TV 中打开视频',
    properties: ['openFile'],
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'm4v', 'webm', 'mov', 'mkv', 'avi', 'ts', 'm2ts']
      },
      { name: '所有文件', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return describeLocalVideo(result.filePaths[0]);
});

ipcMain.handle('phonecast:start', async () => {
  const info = await startPhoneCast({
    uploadDirectory: path.join(app.getPath('userData'), 'phone-cast'),
    onMedia: (media) => {
      sendToMainWindow('phonecast:media', media);
    },
    onPhoneConnected: () => {
      sendToMainWindow('phonecast:phone-connected');
    }
  });

  if (!info.primaryUrl) {
    await stopPhoneCast();
    throw new Error('没有检测到可用的局域网地址，请先连接 Wi-Fi 或开启热点。');
  }

  const qrDataUrl = await QRCode.toDataURL(info.primaryUrl, {
    width: 340,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#071921',
      light: '#ffffff'
    }
  });

  return { ...info, qrDataUrl };
});

ipcMain.handle('phonecast:stop', async () => stopPhoneCast());

ipcMain.handle('phonecast:open-projection-settings', async () => {
  await shell.openExternal('ms-settings:projection');
  return true;
});

ipcMain.handle('phonecast:list-capture-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window'],
    thumbnailSize: { width: 0, height: 0 },
    fetchWindowIcons: false
  });
  return sources
    .filter((source) => source.name.trim())
    .map((source) => ({
      id: source.id,
      name: source.name,
      likelyPhone: /ahz[\s-]*stream|无线|投屏|投影|手机|connect|wireless|project|airserver|airplay|uxplay|reflector|letsview|apowermirror|5kplayer|lonelyscreen|mirror|cast/i.test(source.name)
    }))
    .slice(0, 80);
});

ipcMain.handle('airplay:start', () => startAirplayExtension());
ipcMain.handle('airplay:stop', () => stopAirplayExtension());
ipcMain.handle('airplay:status', () => airplayExtensionStatus());
ipcMain.handle('airplay:open-notice', async () => {
  const notice = path.join(airplayExtensionDirectory(), 'EXTENSION_NOTICE.md');
  return shell.openPath(notice);
});

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  configurePermissions();
  createWindow();

  if (SMOKE_TEST) {
    setTimeout(() => finishSmokeTest(false, 'smoke test timed out'), 35000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPhoneCast().catch(() => {});
  stopAirplayExtension();
});
