'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.webm', '.mov', '.mkv', '.avi', '.ts', '.m2ts']);

let activeService = null;

function normalizeAddress(address = '') {
  return address.replace(/^::ffff:/, '');
}

function isPrivateAddress(address = '') {
  const value = normalizeAddress(address);
  if (value === '::1' || value === '127.0.0.1') {
    return true;
  }
  if (/^10\./.test(value) || /^192\.168\./.test(value) || /^169\.254\./.test(value)) {
    return true;
  }
  const match172 = value.match(/^172\.(\d+)\./);
  if (match172 && Number(match172[1]) >= 16 && Number(match172[1]) <= 31) {
    return true;
  }
  return /^(fc|fd|fe80):/i.test(value);
}

function getLanAddresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();

  for (const [name, entries] of Object.entries(interfaces)) {
    const virtualInterface = /vmware|virtualbox|hyper-v|vethernet|tailscale|zerotier|loopback/i.test(name);
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' || entry.internal || !isPrivateAddress(entry.address)) {
        continue;
      }
      if (entry.address.startsWith('169.254.') && entry.address !== '192.168.137.1') {
        continue;
      }
      if (virtualInterface && entry.address !== '192.168.137.1') {
        continue;
      }
      const physicalInterface = /wlan|wi-?fi|wireless|ethernet|以太网|无线|本地连接/i.test(name);
      addresses.push({
        interface: name,
        address: entry.address,
        rank:
          entry.address === '192.168.137.1' ? 0 :
          physicalInterface ? 1 :
          /^192\.168\./.test(entry.address) ? 2 :
          /^10\./.test(entry.address) ? 3 :
          4
      });
    }
  }

  return addresses
    .sort((left, right) => left.rank - right.rank)
    .filter((entry, index, list) => list.findIndex((item) => item.address === entry.address) === index)
    .map(({ interface: interfaceName, address }) => ({ interface: interfaceName, address }));
}

function sanitizeFileName(value) {
  const original = String(value || 'phone-media');
  const base = path.basename(original).replace(/[\u0000-\u001f<>:"/\\|?*]+/g, '_').trim();
  return (base || 'phone-media').slice(0, 120);
}

function mediaKindFor(name, mime = '') {
  const extension = path.extname(name).toLowerCase();
  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }
  return '';
}

function extensionForMime(mime = '') {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm'
  };
  return map[mime.split(';')[0].toLowerCase()] || '';
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(text);
}

function mobilePage(token, deviceName) {
  const safeToken = JSON.stringify(token);
  const safeDeviceName = JSON.stringify(deviceName);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'">
  <title>投送到 Ahz TV</title>
  <style>
    :root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;background:#070a0e;color:#f4f8fa}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 85% 0,#0e3c52 0,transparent 36%),#070a0e;padding:24px}
    main{width:min(540px,100%);margin:0 auto}.brand{display:flex;align-items:center;gap:12px;margin:12px 0 34px}.mark{width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,#79e5ff,#078bd3);display:grid;place-items:center;box-shadow:0 12px 30px #078bd344}.mark:after{content:"";border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:5px}
    h1{margin:0;font-size:25px;letter-spacing:-.03em}small,p{color:#7f8b94}.hero{padding:24px;border:1px solid #ffffff12;border-radius:20px;background:linear-gradient(145deg,#111922,#0b1015)}
    h2{margin:0 0 8px;font-size:18px}.drop{display:block;margin-top:20px;padding:28px 18px;border:1px dashed #3acaff55;border-radius:16px;background:#35c9ff08;text-align:center}
    input[type=file]{position:absolute;opacity:0;pointer-events:none}.pick{display:inline-flex;align-items:center;justify-content:center;min-width:180px;height:44px;padding:0 20px;border-radius:11px;background:linear-gradient(180deg,#43ceff,#078bd3);font-weight:700}
    .selected{margin:15px 0 5px;min-height:20px;color:#c7d3da;font-size:13px}.status{margin-top:16px;color:#73dcff;font-size:13px;line-height:1.6}
    ol{margin:20px 0 0;padding-left:20px;color:#8e9aa3;font-size:13px;line-height:1.9}.note{margin-top:18px;padding:13px 15px;border-radius:12px;background:#ffffff08;color:#687680;font-size:12px;line-height:1.6}
    @media(max-width:420px){body{padding:16px}.hero{padding:20px}h1{font-size:22px}}
  </style>
</head>
<body>
  <main>
    <div class="brand"><span class="mark"></span><div><h1>Ahz TV</h1><small>手机投送到电脑</small></div></div>
    <section class="hero">
      <h2>发送照片或视频</h2>
      <p>选择手机里的照片、视频，确认后会直接发送到 <span id="device"></span>。</p>
      <form id="uploadForm">
        <label class="drop" for="files">
          <input id="files" type="file" accept="image/*,video/*" multiple>
          <span class="pick">选择照片或视频</span>
          <div class="selected" id="selected">尚未选择文件</div>
        </label>
        <button class="pick" id="sendButton" type="submit" style="width:100%;border:0;margin-top:14px">发送到 Ahz TV</button>
      </form>
      <div class="status" id="status">等待发送</div>
      <ol>
        <li>电脑端保持 Ahz TV 打开。</li>
        <li>手机和电脑连接同一个 Wi-Fi，或连接电脑热点。</li>
        <li>发送完成后，电脑会直接显示媒体内容。</li>
      </ol>
    </section>
    <div class="note">仅支持照片和视频。文件只在当前局域网内传输，不会上传到互联网。</div>
  </main>
  <script>
    const token=${safeToken};
    document.querySelector('#device').textContent=${safeDeviceName};
    const input=document.querySelector('#files');
    const selected=document.querySelector('#selected');
    const status=document.querySelector('#status');
    const sendButton=document.querySelector('#sendButton');
    input.addEventListener('change',()=>{
      const files=[...input.files];
      selected.textContent=files.length?files.map(file=>file.name).join('、'):'尚未选择文件';
    });
    document.querySelector('#uploadForm').addEventListener('submit',async(event)=>{
      event.preventDefault();
      const files=[...input.files];
      if(!files.length){status.textContent='请先选择照片或视频';return}
      sendButton.disabled=true;
      let sent=0;
      try{
        for(const file of files){
          status.textContent='正在发送 '+(sent+1)+'/'+files.length+'：'+file.name;
          const params=new URLSearchParams({token,name:file.name,type:file.type||'application/octet-stream'});
          const response=await fetch('/api/upload?'+params.toString(),{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});
          if(!response.ok){throw new Error(await response.text())}
          sent++;
        }
        status.textContent='已发送 '+sent+' 个文件，电脑端应该已经显示。';
        input.value='';
        selected.textContent='尚未选择文件';
      }catch(error){
        status.textContent='发送失败：'+error.message;
      }finally{
        sendButton.disabled=false;
      }
    });
  </script>
</body>
</html>`;
}

async function startPhoneCast({ uploadDirectory, onMedia, onPhoneConnected }) {
  if (activeService) {
    const refreshedAddresses = getLanAddresses();
    const refreshedUrls = refreshedAddresses.map(({ interface: interfaceName, address }) => ({
      interface: interfaceName,
      url: `http://${address}:${activeService.publicInfo.port}/?token=${activeService.publicInfo.token}`
    }));
    activeService.publicInfo = {
      ...activeService.publicInfo,
      addresses: refreshedAddresses,
      urls: refreshedUrls,
      primaryUrl: refreshedUrls[0]?.url || ''
    };
    return activeService.publicInfo;
  }

  fs.mkdirSync(uploadDirectory, { recursive: true });
  const token = crypto.randomBytes(18).toString('hex');
  const deviceName = os.hostname();

  const server = http.createServer((request, response) => {
    const remoteAddress = request.socket.remoteAddress;
    if (!isPrivateAddress(remoteAddress)) {
      sendText(response, 403, '只允许局域网设备访问');
      return;
    }

    let requestUrl;
    try {
      requestUrl = new URL(request.url, 'http://localhost');
    } catch {
      sendText(response, 400, '请求地址无效');
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/') {
      if (requestUrl.searchParams.get('token') !== token) {
        sendText(response, 403, '二维码已失效，请在电脑上的 Ahz TV 重新打开手机投送');
        return;
      }
      onPhoneConnected?.();
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer'
      });
      response.end(mobilePage(token, deviceName));
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/status') {
      sendJson(response, 200, { name: 'Ahz TV', device: deviceName, ready: true });
      return;
    }

    if (request.method !== 'POST' || requestUrl.pathname !== '/api/upload') {
      sendText(response, 404, 'Not found');
      return;
    }

    if (requestUrl.searchParams.get('token') !== token) {
      sendText(response, 403, '投送授权已失效');
      return;
    }

    const originalName = sanitizeFileName(requestUrl.searchParams.get('name'));
    const mime = String(requestUrl.searchParams.get('type') || request.headers['content-type'] || '');
    const kind = mediaKindFor(originalName, mime);
    if (!kind) {
      sendText(response, 415, '只支持照片和视频');
      return;
    }

    const contentLength = Number(request.headers['content-length'] || 0);
    if (contentLength > MAX_UPLOAD_SIZE) {
      sendText(response, 413, '文件过大，单个文件不能超过 2 GB');
      return;
    }

    const safeExtension = path.extname(originalName) || extensionForMime(mime);
    const storedName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${safeExtension.toLowerCase()}`;
    const finalPath = path.join(uploadDirectory, storedName);
    const partPath = `${finalPath}.part`;
    const output = fs.createWriteStream(partPath, { flags: 'wx' });
    let bytes = 0;
    let failed = false;

    const abortUpload = async () => {
      if (failed) return;
      failed = true;
      output.destroy();
      await fs.promises.unlink(partPath).catch(() => {});
    };

    request.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_UPLOAD_SIZE) {
        abortUpload();
        if (!response.headersSent) sendText(response, 413, '文件过大，单个文件不能超过 2 GB');
        request.destroy();
      }
    });

    request.on('aborted', abortUpload);
    output.on('error', async (error) => {
      await abortUpload();
      if (!response.headersSent) sendText(response, 500, `保存失败：${error.message}`);
    });

    output.on('finish', async () => {
      if (failed) return;
      await fs.promises.rename(partPath, finalPath);
      const media = {
        name: originalName,
        path: finalPath,
        url: new URL(`file:///${finalPath.replace(/\\/g, '/')}`).href,
        size: bytes,
        mime,
        kind,
        receivedAt: Date.now()
      };
      onMedia?.(media);
      sendJson(response, 200, { ok: true, name: originalName, size: bytes, kind });
    });

    request.pipe(output);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '0.0.0.0', resolve);
  });

  const port = server.address().port;
  const addresses = getLanAddresses();
  const urls = addresses.map(({ interface: interfaceName, address }) => ({
    interface: interfaceName,
    url: `http://${address}:${port}/?token=${token}`
  }));

  const publicInfo = {
    port,
    token,
    deviceName,
    addresses,
    urls,
    primaryUrl: urls[0]?.url || ''
  };

  activeService = { server, publicInfo };

  server.on('close', () => {
    activeService = null;
  });

  return publicInfo;
}

async function stopPhoneCast() {
  if (!activeService) {
    return false;
  }
  const { server } = activeService;
  activeService = null;
  await new Promise((resolve) => server.close(resolve));
  return true;
}

module.exports = {
  getLanAddresses,
  isPrivateAddress,
  mediaKindFor,
  sanitizeFileName,
  startPhoneCast,
  stopPhoneCast
};
