'use strict';

const RED_FRUIT_ORIGIN = 'https://hongguoduanju.com';
const FAVORITES_KEY = 'ahz-tv:plugin-favorites';
const RECENT_KEY = 'ahz-tv:recent-plugins';
const LOCAL_RECENT_KEY = 'ahz-tv:local-recent';

const PLUGINS = {
  redfruit: {
    label: '红果短剧',
    url: 'https://hongguoduanju.com/',
    host: 'hongguoduanju.com',
    mark: 'R',
    logoClass: 'provider-redfruit',
    summary: '短剧 · 漫剧 · AI 剧'
  },
  bilibili: {
    label: '哔哩哔哩',
    url: 'https://www.bilibili.com/',
    host: 'www.bilibili.com',
    mark: 'B',
    logoClass: 'provider-bilibili',
    summary: '番剧 · 国创 · 电影'
  },
  tencent: {
    label: '腾讯视频',
    url: 'https://v.qq.com/',
    host: 'v.qq.com',
    mark: 'V',
    logoClass: 'provider-tencent',
    summary: '电视剧 · 电影 · 动漫'
  },
  iqiyi: {
    label: '爱奇艺',
    url: 'https://www.iqiyi.com/',
    host: 'www.iqiyi.com',
    mark: 'i',
    logoClass: 'provider-iqiyi',
    summary: '电视剧 · 电影 · 动漫'
  },
  youku: {
    label: '优酷',
    url: 'https://www.youku.com/',
    host: 'www.youku.com',
    mark: 'Y',
    logoClass: 'provider-youku',
    summary: '剧集 · 电影 · 动漫'
  },
  mgtv: {
    label: '芒果 TV',
    url: 'https://www.mgtv.com/',
    host: 'www.mgtv.com',
    mark: 'M',
    logoClass: 'provider-mgtv',
    summary: '综艺 · 剧集 · 电影'
  },
  migu: {
    label: '咪咕视频',
    url: 'https://www.miguvideo.com/',
    host: 'www.miguvideo.com',
    mark: 'M',
    logoClass: 'provider-migu',
    summary: '体育 · 影视 · 动漫'
  }
};

const siteView = document.querySelector('#siteView');
const homeView = document.querySelector('#homeView');
const playerView = document.querySelector('#playerView');
const localVideo = document.querySelector('#localVideo');
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const goBack = document.querySelector('#goBack');
const goForward = document.querySelector('#goForward');
const goHome = document.querySelector('#goHome');
const reloadPage = document.querySelector('#reloadPage');
const openInBrowser = document.querySelector('#openInBrowser');
const toggleFullscreen = document.querySelector('#toggleFullscreen');
const exitFullscreenButton = document.querySelector('#exitFullscreenButton');
const pageTitle = document.querySelector('#pageTitle');
const pageKicker = document.querySelector('#pageKicker');
const loadState = document.querySelector('#loadState');
const loadLed = document.querySelector('#loadLed');
const loadingBar = document.querySelector('#loadingBar');
const webSourceBadge = document.querySelector('#webSourceBadge');
const webSourceName = document.querySelector('#webSourceName');
const errorPanel = document.querySelector('#errorPanel');
const errorMessage = document.querySelector('#errorMessage');
const retryLoad = document.querySelector('#retryLoad');
const goHomeAfterError = document.querySelector('#goHomeAfterError');
const providerDialog = document.querySelector('#providerDialog');
const openProviders = document.querySelector('#openProviders');
const closeProviders = document.querySelector('#closeProviders');
const dismissProviders = document.querySelector('#dismissProviders');
const toast = document.querySelector('#toast');
const phoneCastDialog = document.querySelector('#phoneCastDialog');
const closePhoneCast = document.querySelector('#closePhoneCast');
const dismissPhoneCast = document.querySelector('#dismissPhoneCast');
const openPhoneCast = document.querySelector('#openPhoneCast');
const heroPhoneCast = document.querySelector('#heroPhoneCast');
const phoneCastQr = document.querySelector('#phoneCastQr');
const phoneCastAddress = document.querySelector('#phoneCastAddress');
const phoneCastState = document.querySelector('#phoneCastState');
const phoneCastLed = document.querySelector('#phoneCastLed');
const copyPhoneCastUrl = document.querySelector('#copyPhoneCastUrl');
const refreshPhoneCastAddress = document.querySelector('#refreshPhoneCastAddress');
const openProjectionSettings = document.querySelector('#openProjectionSettings');
const connectProjectionWindow = document.querySelector('#connectProjectionWindow');
const startAirplayExtension = document.querySelector('#startAirplayExtension');
const connectAirplayFullscreen = document.querySelector('#connectAirplayFullscreen');
const connectAirplayFullscreenLabel = document.querySelector('#connectAirplayFullscreenLabel');
const stopAirplayExtension = document.querySelector('#stopAirplayExtension');
const airplayExtensionState = document.querySelector('#airplayExtensionState');
const viewAirplayNotice = document.querySelector('#viewAirplayNotice');
const projectionView = document.querySelector('#projectionView');
const projectionVideo = document.querySelector('#projectionVideo');
const projectionFrameButton = document.querySelector('#projectionFrameButton');
const projectionFrameMenu = document.querySelector('#projectionFrameMenu');
const projectionFrameOptions = [...document.querySelectorAll('[data-frame-mode]')];
const closeProjection = document.querySelector('#closeProjection');
const castImageView = document.querySelector('#castImageView');
const castImage = document.querySelector('#castImage');
const castImageName = document.querySelector('#castImageName');
const closeCastImage = document.querySelector('#closeCastImage');
const recentGrid = document.querySelector('#recentGrid');
const recentSection = document.querySelector('#recentSection');
const pluginsSection = document.querySelector('#pluginsSection');
const pluginSectionTitle = document.querySelector('#pluginSectionTitle');
const pluginFilterEmpty = document.querySelector('#pluginFilterEmpty');
const clearRecent = document.querySelector('#clearRecent');
const browsePlugins = document.querySelector('#browsePlugins');
const openLocalVideo = document.querySelector('#openLocalVideo');
const dialogOpenLocal = document.querySelector('#dialogOpenLocal');
const playerBack = document.querySelector('#playerBack');
const playerCenterPlay = document.querySelector('#playerCenterPlay');
const playPause = document.querySelector('#playPause');
const playerSeek = document.querySelector('#playerSeek');
const volumeBar = document.querySelector('#volumeBar');
const muteButton = document.querySelector('#muteButton');
const rateButton = document.querySelector('#rateButton');
const playerFullscreen = document.querySelector('#playerFullscreen');
const playerFileName = document.querySelector('#playerFileName');
const currentTime = document.querySelector('#currentTime');
const durationTime = document.querySelector('#durationTime');
const playerError = document.querySelector('#playerError');

let isLoading = false;
let currentUrl = '';
let currentPluginKey = null;
let homeMode = 'home';
let activeSearch = '';
let currentLocalVideo = null;
let phoneCastInfo = null;
let phoneCastStarting = false;
let phoneCastRefreshTimer = null;
let projectionStream = null;
let projectionFrameMode = localStorage.getItem('ahz-tv:projection-frame') || 'auto';
let toastTimer = null;
let loadingTimer = null;

function readStoredArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let favorites = new Set(
  readStoredArray(FAVORITES_KEY).filter((key) => Object.hasOwn(PLUGINS, key))
);
let recentPlugins = readStoredArray(RECENT_KEY)
  .filter((item) => item && Object.hasOwn(PLUGINS, item.key))
  .map((item) => ({
    key: item.key,
    openedAt: Number.isFinite(item.openedAt) ? item.openedAt : Date.now()
  }))
  .slice(0, 8);
let recentLocal = readStoredArray(LOCAL_RECENT_KEY)
  .filter((item) => item && typeof item.url === 'string' && typeof item.name === 'string')
  .map((item) => ({
    name: item.name,
    url: item.url,
    path: typeof item.path === 'string' ? item.path : '',
    size: Number.isFinite(item.size) ? item.size : 0,
    openedAt: Number.isFinite(item.openedAt) ? item.openedAt : Date.now()
  }))
  .slice(0, 8);

function persistLocalState() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  localStorage.setItem(RECENT_KEY, JSON.stringify(recentPlugins));
  localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(recentLocal));
}

function pluginForUrl(urlValue) {
  try {
    const hostname = new URL(urlValue).hostname;
    if (hostname.endsWith(PLUGINS.redfruit.host)) {
      return PLUGINS.redfruit;
    }
    return Object.values(PLUGINS).find((plugin) => plugin.host === hostname) || null;
  } catch {
    return null;
  }
}

function pluginKeyForUrl(urlValue) {
  const plugin = pluginForUrl(urlValue);
  return plugin
    ? Object.keys(PLUGINS).find((key) => PLUGINS[key] === plugin)
    : null;
}

function currentGuestUrl() {
  try {
    return siteView.getURL() || currentUrl;
  } catch {
    return currentUrl;
  }
}

function showToast(message, duration = 2600) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

function setLoadingState(active) {
  isLoading = active;
  clearTimeout(loadingTimer);
  document.body.classList.toggle('is-loading', active);
  loadLed.classList.toggle('is-loading', active);
  loadLed.classList.toggle('is-online', !active);
  loadState.textContent = active ? '正在加载第三方插件' : '第三方插件已连接';

  if (active) {
    loadingBar.classList.remove('is-complete');
    loadingBar.classList.add('is-loading');
  } else {
    loadingBar.classList.remove('is-loading');
    loadingBar.classList.add('is-complete');
    loadingTimer = setTimeout(() => loadingBar.classList.remove('is-complete'), 420);
  }
}

function setHomeStatus() {
  isLoading = false;
  clearTimeout(loadingTimer);
  document.body.classList.remove('is-loading');
  loadLed.classList.remove('is-loading');
  loadLed.classList.add('is-online');
  loadState.textContent = '本地';
  loadingBar.classList.remove('is-loading', 'is-complete');
}

function setActiveNavigation(activeKey) {
  document.querySelectorAll('[data-nav-key]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.navKey === activeKey);
  });
}

function setPageContext(urlValue, title = '') {
  const plugin = pluginForUrl(urlValue);
  const key = pluginKeyForUrl(urlValue);
  const shortTitle = String(title).split('_')[0].split('|')[0].trim();
  let path = '/';

  try {
    path = new URL(urlValue).pathname;
  } catch {
    // Keep neutral defaults.
  }

  if (!plugin) {
    webSourceBadge.hidden = true;
    pageKicker.textContent = 'Ahz TV';
    pageTitle.textContent = '我的首页';
    return;
  }

  webSourceBadge.hidden = false;
  webSourceName.textContent = plugin.label;
  pageKicker.textContent = `第三方插件 · ${plugin.label}`;

  if (key === 'redfruit') {
    if (path === '/') {
      pageTitle.textContent = '红果短剧官方网页';
    } else if (path.startsWith('/category/real-drama')) {
      pageTitle.textContent = '真人短剧';
    } else if (path.startsWith('/category/comic-drama')) {
      pageTitle.textContent = '漫剧';
    } else if (path.startsWith('/category/ai-drama')) {
      pageTitle.textContent = 'AI 剧';
    } else if (path.startsWith('/rank/')) {
      pageTitle.textContent = '热播榜';
    } else if (path.startsWith('/search')) {
      const encodedKeyword = path.startsWith('/search/') ? path.slice('/search/'.length) : '';
      try {
        pageTitle.textContent = encodedKeyword ? `搜索：${decodeURIComponent(encodedKeyword)}` : '搜索';
      } catch {
        pageTitle.textContent = '搜索';
      }
    } else {
      pageTitle.textContent = shortTitle || plugin.label;
    }
  } else {
    pageTitle.textContent = shortTitle || plugin.label;
  }
}

function syncPageContext() {
  if (document.body.classList.contains('is-home')) {
    return;
  }
  let title = '';
  try {
    title = siteView.getTitle();
  } catch {
    // The guest may be between navigations.
  }
  setPageContext(currentGuestUrl(), title);
}

function updateNavigationState() {
  if (!playerView.hidden) {
    goBack.disabled = true;
    goForward.disabled = true;
    return;
  }
  if (document.body.classList.contains('is-home')) {
    goBack.disabled = true;
    goForward.disabled = true;
    return;
  }

  let canGoBack = false;
  let canGoForward = false;
  try {
    canGoBack = siteView.canGoBack();
    canGoForward = siteView.canGoForward();
  } catch {
    // The guest may not be attached during navigation.
  }
  goBack.disabled = !canGoBack;
  goForward.disabled = !canGoForward;
}

function formatRecentTime(timestamp) {
  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(elapsed / 3600000);
  const days = Math.floor(elapsed / 86400000);

  if (minutes < 1) return '刚刚打开';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  return `${days} 天前`;
}

function formatFileSize(bytes) {
  if (!bytes) return '本地文件';
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function createEmptyRecent() {
  const button = document.createElement('button');
  button.className = 'empty-media-card';
  button.innerHTML = `
    <span class="empty-media-art">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5v11L18 12z"></path></svg>
    </span>
    <strong>${activeSearch ? '没有匹配的本地视频' : '播放本地视频'}</strong>
    <span>${activeSearch ? '换一个关键词，或打开新的视频文件。' : '支持 MP4、WebM、MOV 等格式'}</span>
  `;
  button.addEventListener('click', pickAndPlayLocalVideo);
  return button;
}

function renderRecent() {
  const query = activeSearch.toLowerCase();
  const visibleRecent = recentLocal.filter(({ name }) => {
    return !query || name.toLowerCase().includes(query);
  });
  recentGrid.replaceChildren();

  if (visibleRecent.length === 0) {
    recentGrid.append(createEmptyRecent());
    return;
  }

  visibleRecent.slice(0, 8).forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'media-card';

    const button = document.createElement('button');
    button.className = 'media-card-open';

    const poster = document.createElement('span');
    poster.className = `media-poster local-poster local-poster-${index % 4}`;
    const mark = document.createElement('span');
    mark.className = 'poster-mark';
    mark.textContent = 'A';
    const title = document.createElement('strong');
    title.textContent = item.name.replace(/\.[^.]+$/, '');
    const detail = document.createElement('small');
    detail.textContent = 'LOCAL VIDEO';
    poster.append(mark, title, detail);

    const playHint = document.createElement('span');
    playHint.className = 'card-play-hint';
    playHint.innerHTML = '<svg viewBox="0 0 20 20"><path d="M7 4.5v11L16 10z"></path></svg>';
    button.append(poster, playHint);
    button.addEventListener('click', () => showLocalVideo(item));

    const info = document.createElement('div');
    info.className = 'media-card-info';
    const infoTitle = document.createElement('strong');
    infoTitle.textContent = item.name;
    const infoDetail = document.createElement('small');
    infoDetail.textContent = `${formatFileSize(item.size)} · ${formatRecentTime(item.openedAt)}`;
    info.append(infoTitle, infoDetail);

    card.append(button, info);
    recentGrid.append(card);
  });
}

function renderPlugins() {
  const search = activeSearch.toLowerCase();
  let visibleCount = 0;

  document.querySelectorAll('[data-plugin-card]').forEach((card) => {
    const key = card.dataset.pluginCard;
    const plugin = PLUGINS[key];
    const matchesSearch = !search || plugin.label.toLowerCase().includes(search);
    const matchesMode = homeMode !== 'favorites' || favorites.has(key);
    const visible = matchesSearch && matchesMode;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  pluginFilterEmpty.hidden = visibleCount > 0;
  if (activeSearch) {
    pluginSectionTitle.textContent = `搜索：${activeSearch}`;
  } else {
    pluginSectionTitle.textContent = homeMode === 'favorites' ? '我的收藏' : '在线片源';
  }

  document.querySelectorAll('[data-favorite-key]').forEach((button) => {
    const key = button.dataset.favoriteKey;
    const selected = favorites.has(key);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? '取消收藏' : '收藏'}${PLUGINS[key].label}`);
  });
}

function renderHome(mode = homeMode) {
  homeMode = mode;
  recentSection.hidden = mode === 'favorites';
  pluginsSection.hidden = mode === 'history';
  clearRecent.hidden = mode === 'favorites' || recentLocal.length === 0;

  const titles = {
    home: ['Ahz TV', '影院首页'],
    history: ['Ahz TV · 本地记录', '最近播放'],
    favorites: ['Ahz TV · 本地收藏', '我的收藏']
  };
  const [kicker, title] = titles[mode] || titles.home;
  pageKicker.textContent = kicker;
  pageTitle.textContent = title;
  document.title = `${title} · Ahz TV`;

  renderRecent();
  renderPlugins();
  setActiveNavigation(`app-${mode}`);
}

function showHome(mode = 'home', resetSearch = true) {
  stopProjectionCapture();
  homeMode = mode;
  currentPluginKey = null;
  currentLocalVideo = null;
  currentUrl = '';
  errorPanel.hidden = true;
  playerView.hidden = true;
  castImageView.hidden = true;
  castImage.removeAttribute('src');
  webSourceBadge.hidden = true;
  playerView.classList.remove('is-playing');
  localVideo.pause();
  localVideo.removeAttribute('src');
  localVideo.load();
  homeView.hidden = false;
  siteView.hidden = true;
  document.body.classList.add('is-home');
  document.body.classList.remove('is-player');
  goHome.disabled = true;
  reloadPage.disabled = true;
  openInBrowser.disabled = true;
  setHomeStatus();

  if (resetSearch) {
    activeSearch = '';
    searchInput.value = '';
  }

  updateNavigationState();
  renderHome(mode);
}

function showPluginSurface() {
  stopProjectionCapture();
  document.body.classList.remove('is-home');
  document.body.classList.remove('is-player');
  playerView.hidden = true;
  castImageView.hidden = true;
  castImage.removeAttribute('src');
  webSourceBadge.hidden = true;
  playerView.classList.remove('is-playing');
  currentLocalVideo = null;
  localVideo.pause();
  localVideo.removeAttribute('src');
  localVideo.load();
  homeView.hidden = true;
  siteView.hidden = false;
  goHome.disabled = false;
  reloadPage.disabled = false;
  openInBrowser.disabled = false;
}

function recordPluginOpen(key) {
  recentPlugins = [
    { key, openedAt: Date.now() },
    ...recentPlugins.filter((item) => item.key !== key)
  ].slice(0, 8);
  persistLocalState();
}

function formatPlayerTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updatePlayerProgress() {
  const duration = Number.isFinite(localVideo.duration) ? localVideo.duration : 0;
  const progress = duration > 0 ? (localVideo.currentTime / duration) * 1000 : 0;
  playerSeek.value = String(progress);
  currentTime.textContent = formatPlayerTime(localVideo.currentTime);
  durationTime.textContent = formatPlayerTime(duration);
}

function updatePlayerState() {
  const playing = !localVideo.paused && !localVideo.ended;
  playerView.classList.toggle('is-playing', playing);
  playerView.classList.toggle('is-muted', localVideo.muted || localVideo.volume === 0);
  playerCenterPlay.setAttribute('aria-label', playing ? '暂停' : '播放');
  playPause.setAttribute('aria-label', playing ? '暂停' : '播放');
}

function recordLocalOpen(video) {
  recentLocal = [
    { ...video, openedAt: Date.now() },
    ...recentLocal.filter((item) => item.url !== video.url)
  ].slice(0, 8);
  persistLocalState();
}

async function showLocalVideo(video) {
  if (!video || !video.url) return;
  stopProjectionCapture();
  castImageView.hidden = true;
  castImage.removeAttribute('src');
  currentPluginKey = null;
  currentUrl = '';
  currentLocalVideo = video;
  document.body.classList.remove('is-home');
  document.body.classList.add('is-player');
  homeView.hidden = true;
  siteView.hidden = true;
  errorPanel.hidden = true;
  playerView.hidden = false;
  webSourceBadge.hidden = true;
  playerError.hidden = true;
  playerFileName.textContent = video.name;
  localVideo.src = video.url;
  localVideo.playbackRate = 1;
  rateButton.textContent = '1.0×';
  volumeBar.value = String(Math.round(localVideo.volume * 100));
  localVideo.load();
  setHomeStatus();
  pageKicker.textContent = 'Ahz TV · 本地播放';
  pageTitle.textContent = video.name;
  document.title = `${video.name} · Ahz TV`;
  goHome.disabled = false;
  goBack.disabled = true;
  goForward.disabled = true;
  reloadPage.disabled = true;
  openInBrowser.disabled = true;
  setActiveNavigation('app-history');
  recordLocalOpen(video);
  updatePlayerProgress();
  updatePlayerState();
  try {
    await localVideo.play();
  } catch {
    // The user can start playback manually if autoplay is denied.
  }
}

async function pickAndPlayLocalVideo() {
  const video = await window.desktop.pickVideo();
  if (video) {
    closeProviderDialog();
    await showLocalVideo(video);
  }
}

function togglePlayback() {
  if (!currentLocalVideo) return;
  if (localVideo.paused) {
    localVideo.play().catch(() => {
      playerError.textContent = '这个视频暂时无法播放，请检查文件或编码格式。';
      playerError.hidden = false;
    });
  } else {
    localVideo.pause();
  }
}

function stopProjectionCapture() {
  if (projectionStream) {
    for (const track of projectionStream.getTracks()) {
      track.stop();
    }
  }
  projectionStream = null;
  projectionVideo.srcObject = null;
  projectionView.hidden = true;
}

function chooseProjectionFrame(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (projectionFrameMode === 'contain') return 'contain';
  if (projectionFrameMode === 'cover') return 'cover';
  if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) return 'contain';

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  // Auto only crops when the aspect ratios are close. Mirrored portrait
  // screens and strongly letterboxed content remain fully visible.
  return Math.abs(Math.log(sourceRatio / targetRatio)) <= 0.16 ? 'cover' : 'contain';
}

function applyProjectionFrame() {
  const fit = chooseProjectionFrame(
    projectionVideo.videoWidth,
    projectionVideo.videoHeight,
    projectionView.clientWidth,
    projectionView.clientHeight
  );
  projectionView.classList.toggle('uses-cover', fit === 'cover');
}

function setProjectionFrameMode(mode, { persist = true } = {}) {
  projectionFrameMode = ['auto', 'contain', 'cover'].includes(mode) ? mode : 'auto';
  if (persist) {
    localStorage.setItem('ahz-tv:projection-frame', projectionFrameMode);
  }
  projectionFrameOptions.forEach((option) => {
    option.classList.toggle('is-active', option.dataset.frameMode === projectionFrameMode);
  });
  projectionFrameButton.textContent = {
    auto: '画幅：自动适配',
    contain: '画幅：还原画幅',
    cover: '画幅：满屏播放'
  }[projectionFrameMode];
  applyProjectionFrame();
}

function showCastImage(media) {
  stopProjectionCapture();
  normalVideoCleanup();
  castImage.src = media.url;
  castImageName.textContent = media.name;
  homeView.hidden = true;
  siteView.hidden = true;
  playerView.hidden = true;
  errorPanel.hidden = true;
  castImageView.hidden = false;
  document.body.classList.remove('is-home');
  document.body.classList.add('is-player');
  setHomeStatus();
  pageKicker.textContent = 'Ahz TV · 手机投送';
  pageTitle.textContent = media.name;
  document.title = `${media.name} · Ahz TV`;
  setActiveNavigation('app-history');
  showToast('已接收手机投送的照片');
}

function normalVideoCleanup() {
  currentLocalVideo = null;
  playerView.hidden = true;
  playerView.classList.remove('is-playing');
  localVideo.pause();
  localVideo.removeAttribute('src');
  localVideo.load();
}

async function handlePhoneMedia(media) {
  clearInterval(phoneCastRefreshTimer);
  phoneCastRefreshTimer = null;
  phoneCastDialog.hidden = true;
  document.body.classList.remove('dialog-open');
  if (media.kind === 'video') {
    await showLocalVideo(media);
    showToast('已接收手机投送的视频');
  } else {
    showCastImage(media);
  }
}

async function refreshPhoneCastInfo(manual = false) {
  if (phoneCastStarting) return;

  phoneCastStarting = true;
  if (manual || !phoneCastInfo) {
    phoneCastLed.classList.remove('is-ready');
    phoneCastState.textContent = manual ? '正在刷新网络地址…' : '正在启动局域网服务…';
    phoneCastAddress.textContent = '请稍候';
  }
  copyPhoneCastUrl.disabled = true;

  try {
    const previousAddress = phoneCastInfo?.primaryUrl;
    phoneCastInfo = await window.desktop.startPhoneCast();
    phoneCastQr.src = phoneCastInfo.qrDataUrl;
    phoneCastAddress.textContent =
      `${phoneCastInfo.urls[0]?.interface || '局域网'} · ${phoneCastInfo.primaryUrl}`;
    phoneCastState.textContent = manual
      ? '网络地址已刷新'
      : previousAddress && previousAddress !== phoneCastInfo.primaryUrl
        ? '网络地址已自动更新'
        : '等待手机扫码';
    phoneCastLed.classList.add('is-ready');
    copyPhoneCastUrl.disabled = false;
  } catch (error) {
    phoneCastState.textContent = '启动失败';
    phoneCastAddress.textContent = error.message || '没有检测到可用的局域网地址';
    phoneCastInfo = null;
  } finally {
    phoneCastStarting = false;
  }
}

async function openPhoneCastDialog() {
  phoneCastDialog.hidden = false;
  document.body.classList.add('dialog-open');
  refreshAirplayExtensionStatus();
  await refreshPhoneCastInfo(false);
  clearInterval(phoneCastRefreshTimer);
  phoneCastRefreshTimer = setInterval(() => {
    if (!phoneCastDialog.hidden) {
      refreshPhoneCastInfo(false);
    }
  }, 5000);
}

function renderAirplayExtensionStatus(status) {
  if (!status?.available) {
    airplayExtensionState.textContent = 'Ahz-Stream 接收器文件不可用';
    airplayExtensionState.classList.remove('is-running');
    startAirplayExtension.disabled = true;
    stopAirplayExtension.disabled = true;
    return;
  }

  startAirplayExtension.disabled = status.running;
  stopAirplayExtension.disabled = !status.running;
  airplayExtensionState.classList.toggle('is-running', status.running);
  airplayExtensionState.textContent = status.running
    ? `接收器运行中 · 请选择 ${status.receiverName}`
    : 'Ahz-Stream 未启动';
}

async function refreshAirplayExtensionStatus() {
  try {
    renderAirplayExtensionStatus(await window.desktop.getAirplayStatus());
  } catch {
    airplayExtensionState.textContent = '无法读取接收器状态';
  }
}

async function launchAirplayExtension() {
  startAirplayExtension.disabled = true;
  airplayExtensionState.textContent = '正在启动内置接收器…';
  try {
    const status = await window.desktop.startAirplay();
    renderAirplayExtensionStatus(status);
    showToast('Ahz-Stream 已启动，请在 iPhone 控制中心选择 Ahz-Stream', 5200);
  } catch (error) {
    airplayExtensionState.textContent = error.message || '内置接收器启动失败';
  }
}

async function haltAirplayExtension() {
  stopAirplayExtension.disabled = true;
  try {
    await window.desktop.stopAirplay();
    await refreshAirplayExtensionStatus();
    showToast('Ahz-Stream 接收器已停止');
  } catch {
    await refreshAirplayExtensionStatus();
  }
}

function closePhoneCastDialog() {
  clearInterval(phoneCastRefreshTimer);
  phoneCastRefreshTimer = null;
  phoneCastDialog.hidden = true;
  document.body.classList.remove('dialog-open');
}

async function copyPhoneCastAddress() {
  if (!phoneCastInfo?.primaryUrl) return;
  try {
    await navigator.clipboard.writeText(phoneCastInfo.primaryUrl);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = phoneCastInfo.primaryUrl;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast('手机投送地址已复制');
}

async function setWindowFullscreen(enabled) {
  const state = await window.desktop.getState();
  if (state.isFullScreen !== enabled) {
    await window.desktop.windowAction('toggle-fullscreen');
  }
  document.body.classList.toggle('is-fullscreen', enabled);
}

async function connectProjectionCapture({ fullScreen = false } = {}) {
  connectProjectionWindow.disabled = true;
  connectAirplayFullscreen.disabled = true;
  connectProjectionWindow.textContent = '正在查找…';
  connectAirplayFullscreenLabel.textContent = '正在查找…';
  try {
    stopProjectionCapture();
    normalVideoCleanup();
    projectionStream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true
    });
    projectionVideo.srcObject = projectionStream;
    await projectionVideo.play().catch(() => {});
    setProjectionFrameMode(projectionFrameMode, { persist: false });
    homeView.hidden = true;
    siteView.hidden = true;
    playerView.hidden = true;
    castImageView.hidden = true;
    errorPanel.hidden = true;
    phoneCastDialog.hidden = true;
    projectionView.hidden = false;
    document.body.classList.remove('is-home');
    document.body.classList.add('is-player');
    pageKicker.textContent = 'Ahz TV · 手机实时投屏';
    pageTitle.textContent = projectionStream.getVideoTracks()[0]?.label || 'Ahz-Stream 实时投屏';
    if (fullScreen) {
      await setWindowFullscreen(true);
    }
  } catch (error) {
    stopProjectionCapture();
    showToast(
      error.name === 'NotAllowedError'
        ? '没有检测到可捕获的投屏窗口。请先启动 Ahz-Stream，并让手机画面显示出来。'
        : `投屏窗口捕获失败：${error.message}`,
      5200
    );
  } finally {
    connectProjectionWindow.disabled = false;
    connectAirplayFullscreen.disabled = false;
    connectProjectionWindow.textContent = '捕获投屏窗口';
    connectAirplayFullscreenLabel.textContent = '全屏观看';
  }
}

async function launchAirplayFullscreenCapture() {
  try {
    const status = await window.desktop.getAirplayStatus();
    if (!status.running) {
      renderAirplayExtensionStatus(await window.desktop.startAirplay());
    }
    await connectProjectionCapture({ fullScreen: true });
  } catch (error) {
    showToast(error.message || 'Ahz-Stream 全屏启动失败', 4800);
  }
}

function navigate(url) {
  if (!url || !/^https?:\/\//i.test(url)) {
    showToast('这个链接暂时无法打开');
    return;
  }

  showPluginSurface();
  errorPanel.hidden = true;
  setLoadingState(true);
  currentUrl = url;
  currentPluginKey = pluginKeyForUrl(url);
  setActiveNavigation(currentPluginKey ? `plugin-${currentPluginKey}` : '');
  setPageContext(url);

  try {
    siteView.loadURL(url);
  } catch {
    errorMessage.textContent = '插件网页尚未初始化完成，请稍后重试。';
    errorPanel.hidden = false;
  }
}

function openPlugin(key, url) {
  const plugin = PLUGINS[key];
  if (!plugin) {
    showToast('这个片源插件不存在');
    return;
  }

  recordPluginOpen(key);
  closeProviderDialog();
  activeSearch = '';
  searchInput.value = '';
  navigate(url || plugin.url);
}

function handleSearchSubmit(event) {
  event.preventDefault();
  activeSearch = searchInput.value.trim();
  showHome('home', false);
  renderHome('home');

  if (activeSearch) {
    pluginsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleFavorite(key) {
  if (!Object.hasOwn(PLUGINS, key)) {
    return;
  }

  if (favorites.has(key)) {
    favorites.delete(key);
  } else {
    favorites.add(key);
  }
  persistLocalState();
  renderPlugins();
  showToast(favorites.has(key) ? `已收藏 ${PLUGINS[key].label}` : `已取消收藏 ${PLUGINS[key].label}`);
}

function openProviderDialog() {
  providerDialog.hidden = false;
  document.body.classList.add('dialog-open');
}

function closeProviderDialog() {
  providerDialog.hidden = true;
  document.body.classList.remove('dialog-open');
}

document.querySelectorAll('[data-window-action]').forEach((button) => {
  button.addEventListener('click', () => {
    window.desktop.windowAction(button.dataset.windowAction);
  });
});

document.querySelectorAll('[data-home-view]').forEach((button) => {
  button.addEventListener('click', () => {
    showHome(button.dataset.homeView);
  });
});

document.querySelectorAll('[data-plugin-key][data-url]').forEach((button) => {
  if (button.closest('[data-plugin-card]') && !button.classList.contains('plugin-open')) {
    return;
  }
  button.addEventListener('click', () => {
    openPlugin(button.dataset.pluginKey, button.dataset.url);
  });
});

document.querySelectorAll('[data-favorite-key]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFavorite(button.dataset.favoriteKey);
  });
});

searchForm.addEventListener('submit', handleSearchSubmit);
goBack.addEventListener('click', () => {
  if (document.body.classList.contains('is-home')) return;
  try {
    if (siteView.canGoBack()) siteView.goBack();
  } catch {
    updateNavigationState();
  }
});
goForward.addEventListener('click', () => {
  if (document.body.classList.contains('is-home')) return;
  try {
    if (siteView.canGoForward()) siteView.goForward();
  } catch {
    updateNavigationState();
  }
});
goHome.addEventListener('click', () => showHome('home'));
reloadPage.addEventListener('click', () => {
  if (document.body.classList.contains('is-home')) {
    showToast('你已经在 Ahz TV 首页');
    return;
  }
  siteView.reload();
});
openInBrowser.addEventListener('click', async () => {
  if (document.body.classList.contains('is-home')) return;
  const opened = await window.desktop.openExternal(currentGuestUrl());
  if (opened) showToast('已交给系统默认浏览器打开第三方网页');
});
openPhoneCast.addEventListener('click', openPhoneCastDialog);
heroPhoneCast.addEventListener('click', openPhoneCastDialog);
toggleFullscreen.addEventListener('click', () => {
  window.desktop.windowAction('toggle-fullscreen');
});
exitFullscreenButton.addEventListener('click', () => {
  window.desktop.windowAction('toggle-fullscreen');
});
openProviders.addEventListener('click', openProviderDialog);
closeProviders.addEventListener('click', closeProviderDialog);
dismissProviders.addEventListener('click', closeProviderDialog);
closePhoneCast.addEventListener('click', closePhoneCastDialog);
dismissPhoneCast.addEventListener('click', closePhoneCastDialog);
copyPhoneCastUrl.addEventListener('click', copyPhoneCastAddress);
refreshPhoneCastAddress.addEventListener('click', () => refreshPhoneCastInfo(true));
openProjectionSettings.addEventListener('click', async () => {
  await window.desktop.openProjectionSettings();
});
connectProjectionWindow.addEventListener('click', connectProjectionCapture);
startAirplayExtension.addEventListener('click', launchAirplayExtension);
connectAirplayFullscreen.addEventListener('click', launchAirplayFullscreenCapture);
stopAirplayExtension.addEventListener('click', haltAirplayExtension);
viewAirplayNotice.addEventListener('click', () => window.desktop.openAirplayNotice());
closeProjection.addEventListener('click', async () => {
  stopProjectionCapture();
  await setWindowFullscreen(false);
  showHome('home');
});
projectionFrameButton.addEventListener('click', (event) => {
  event.stopPropagation();
  const opening = projectionFrameMenu.hidden;
  projectionFrameMenu.hidden = !opening;
  projectionFrameButton.setAttribute('aria-expanded', String(opening));
});
projectionFrameOptions.forEach((option) => {
  option.addEventListener('click', (event) => {
    event.stopPropagation();
    setProjectionFrameMode(option.dataset.frameMode);
    projectionFrameMenu.hidden = true;
    projectionFrameButton.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('click', () => {
  projectionFrameMenu.hidden = true;
  projectionFrameButton.setAttribute('aria-expanded', 'false');
});
projectionVideo.addEventListener('loadedmetadata', applyProjectionFrame);
window.addEventListener('resize', applyProjectionFrame);
closeCastImage.addEventListener('click', () => showHome('home'));
document.querySelector('#railHome').addEventListener('click', () => showHome('home'));
browsePlugins.addEventListener('click', () => {
  showHome('home');
  requestAnimationFrame(() => {
    pluginsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
openLocalVideo.addEventListener('click', pickAndPlayLocalVideo);
dialogOpenLocal.addEventListener('click', pickAndPlayLocalVideo);
playerBack.addEventListener('click', () => showHome('home'));
playPause.addEventListener('click', togglePlayback);
playerCenterPlay.addEventListener('click', togglePlayback);
localVideo.addEventListener('click', togglePlayback);
localVideo.addEventListener('dblclick', () => {
  window.desktop.windowAction('toggle-fullscreen');
});
playerFullscreen.addEventListener('click', () => {
  window.desktop.windowAction('toggle-fullscreen');
});
playerSeek.addEventListener('input', () => {
  if (Number.isFinite(localVideo.duration) && localVideo.duration > 0) {
    localVideo.currentTime = (Number(playerSeek.value) / 1000) * localVideo.duration;
  }
});
volumeBar.addEventListener('input', () => {
  localVideo.volume = Number(volumeBar.value) / 100;
  localVideo.muted = localVideo.volume === 0;
  updatePlayerState();
});
muteButton.addEventListener('click', () => {
  localVideo.muted = !localVideo.muted;
  if (!localVideo.muted && localVideo.volume === 0) {
    localVideo.volume = 0.8;
    volumeBar.value = '80';
  }
  updatePlayerState();
});
rateButton.addEventListener('click', () => {
  const rates = [1, 1.25, 1.5, 2, 0.75];
  const currentIndex = rates.findIndex((rate) => rate === localVideo.playbackRate);
  const nextRate = rates[(currentIndex + 1) % rates.length];
  localVideo.playbackRate = nextRate;
  rateButton.textContent = Number.isInteger(nextRate) ? `${nextRate.toFixed(1)}×` : `${nextRate}×`;
  showToast(`播放速度 ${localVideo.playbackRate}×`);
});
localVideo.addEventListener('loadedmetadata', updatePlayerProgress);
localVideo.addEventListener('durationchange', updatePlayerProgress);
localVideo.addEventListener('timeupdate', updatePlayerProgress);
localVideo.addEventListener('play', updatePlayerState);
localVideo.addEventListener('pause', updatePlayerState);
localVideo.addEventListener('ended', updatePlayerState);
localVideo.addEventListener('volumechange', updatePlayerState);
localVideo.addEventListener('error', () => {
  if (!currentLocalVideo) return;
  playerError.hidden = false;
  playerError.textContent = '当前视频编码无法播放，或文件已经被移动。';
});
clearRecent.addEventListener('click', () => {
  recentLocal = [];
  recentPlugins = [];
  persistLocalState();
  renderRecent();
  clearRecent.hidden = true;
  showToast('本机最近打开记录已清除');
});
retryLoad.addEventListener('click', () => {
  errorPanel.hidden = true;
  setLoadingState(true);
  siteView.reload();
});
goHomeAfterError.addEventListener('click', () => showHome('home'));

siteView.setAttribute('useragent', window.desktop.userAgent);

siteView.addEventListener('did-start-loading', () => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  errorPanel.hidden = true;
  setLoadingState(true);
});

siteView.addEventListener('did-stop-loading', () => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  setLoadingState(false);
  updateNavigationState();
  currentUrl = currentGuestUrl();
  syncPageContext();
});

siteView.addEventListener('did-finish-load', () => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  setLoadingState(false);
  updateNavigationState();
  syncPageContext();
});

siteView.addEventListener('did-navigate', (event) => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  currentUrl = event.url;
  currentPluginKey = pluginKeyForUrl(event.url);
  updateNavigationState();
  setActiveNavigation(currentPluginKey ? `plugin-${currentPluginKey}` : '');
});

siteView.addEventListener('did-navigate-in-page', (event) => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  currentUrl = event.url;
  currentPluginKey = pluginKeyForUrl(event.url);
  updateNavigationState();
  setActiveNavigation(currentPluginKey ? `plugin-${currentPluginKey}` : '');
});

siteView.addEventListener('page-title-updated', (event) => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  const title = String(event.title || '').replace(/_红果短剧.*$/, '').trim();
  if (title) {
    document.title = `${title} · Ahz TV`;
    setPageContext(currentGuestUrl(), title);
  }
});

siteView.addEventListener('did-fail-load', (event) => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  if (!event.isMainFrame || event.errorCode === -3) return;
  setLoadingState(false);
  errorMessage.textContent = `错误 ${event.errorCode}：${event.errorDescription || '第三方插件无法访问'}`;
  errorPanel.hidden = false;
});

siteView.addEventListener('dom-ready', () => {
  if (document.body.classList.contains('is-home') || !playerView.hidden) return;
  updateNavigationState();
  setTimeout(() => {
    if (isLoading) {
      setLoadingState(false);
      syncPageContext();
    }
  }, 1200);
});

window.desktop.onWindowState((state) => {
  document.body.classList.toggle('is-maximized', state.isMaximized);
  document.body.classList.toggle('is-fullscreen', state.isFullScreen);
  exitFullscreenButton.hidden = !state.isFullScreen;
});

window.desktop.onGuestOpenUrl((url) => {
  navigate(url);
});

window.desktop.onBlockedProtocol(({ protocol }) => {
  const label = protocol ? `${protocol}://` : '外部应用';
  showToast(`安全拦截：第三方页面尝试打开 ${label}，Ahz TV 已阻止。`, 4800);
});

window.desktop.onPhoneConnected(() => {
  if (!phoneCastDialog.hidden) {
    phoneCastState.textContent = '手机已连接，可以发送媒体';
    phoneCastLed.classList.add('is-ready');
  }
});

window.desktop.onPhoneCastMedia((media) => {
  handlePhoneMedia(media);
});

window.desktop.onAirplayStatus((status) => {
  renderAirplayExtensionStatus(status);
});

window.desktop.onFocusSearch(() => {
  searchInput.focus();
  searchInput.select();
});

window.desktop.onReload(() => {
  if (!document.body.classList.contains('is-home') && playerView.hidden) {
    siteView.reload();
  }
});

document.addEventListener('keydown', (event) => {
  const focusedTag = document.activeElement?.tagName;
  const typing = focusedTag === 'INPUT' || focusedTag === 'TEXTAREA';
  if (!playerView.hidden && !typing) {
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlayback();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      localVideo.currentTime = Math.max(0, localVideo.currentTime - 5);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      localVideo.currentTime = Math.min(localVideo.duration || Infinity, localVideo.currentTime + 5);
      return;
    }
    if (event.key.toLowerCase() === 'm') {
      muteButton.click();
      return;
    }
    if (event.key.toLowerCase() === 'f') {
      window.desktop.windowAction('toggle-fullscreen');
      return;
    }
    if (event.key === 'Escape') {
      showHome('history');
      return;
    }
  }
  if (event.key === 'Escape' && !providerDialog.hidden) {
    closeProviderDialog();
  }
  if (event.key === 'Escape' && !phoneCastDialog.hidden) {
    closePhoneCastDialog();
  }
  if (event.key === 'Escape' && !projectionView.hidden) {
    stopProjectionCapture();
    setWindowFullscreen(false).catch(() => {});
    showHome('home');
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (!document.body.classList.contains('is-home') && event.altKey && event.key === 'ArrowLeft' && !goBack.disabled) {
    siteView.goBack();
  }
  if (!document.body.classList.contains('is-home') && event.altKey && event.key === 'ArrowRight' && !goForward.disabled) {
    siteView.goForward();
  }
});

window.desktop.getState().then((state) => {
  document.body.classList.toggle('is-maximized', state.isMaximized);
  document.body.classList.toggle('is-fullscreen', state.isFullScreen);
  exitFullscreenButton.hidden = !state.isFullScreen;
  if (state.smokeVideo) {
    showLocalVideo(state.smokeVideo);
  }
});

setProjectionFrameMode(projectionFrameMode, { persist: false });
showHome('home');
refreshAirplayExtensionStatus();
