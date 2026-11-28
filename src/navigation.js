'use strict';

const RED_FRUIT_ORIGIN = 'https://hongguoduanju.com';

const RED_FRUIT_ROUTES = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'real-drama', label: '真人短剧', path: '/category/real-drama' },
  { key: 'comic-drama', label: '漫剧', path: '/category/comic-drama' },
  { key: 'ai-drama', label: 'AI 剧', path: '/category/ai-drama' },
  { key: 'rankings', label: '热播榜', path: '/rank/hot-drama' }
];

const VIDEO_PROVIDERS = [
  { key: 'bilibili', label: '哔哩哔哩', url: 'https://www.bilibili.com/' },
  { key: 'tencent', label: '腾讯视频', url: 'https://v.qq.com/' },
  { key: 'iqiyi', label: '爱奇艺', url: 'https://www.iqiyi.com/' },
  { key: 'youku', label: '优酷', url: 'https://www.youku.com/' },
  { key: 'mgtv', label: '芒果 TV', url: 'https://www.mgtv.com/' },
  { key: 'migu', label: '咪咕视频', url: 'https://www.miguvideo.com/' },
  { key: 'archive', label: 'Internet Archive', url: 'https://archive.org/details/feature_films' },
  { key: 'wikimedia', label: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/Category:Videos' },
  { key: 'blender', label: 'Blender Open Movies', url: 'https://studio.blender.org/films/' }
];

function isWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getUrlProtocol(value) {
  try {
    return new URL(value).protocol.replace(/:$/, '').toLowerCase();
  } catch {
    return '';
  }
}

function buildRedFruitUrl(pathname = '/') {
  if (isWebUrl(pathname)) {
    const parsed = new URL(pathname);
    if (parsed.origin !== RED_FRUIT_ORIGIN) {
      throw new Error('Only red-fruit URLs are accepted here.');
    }
    return parsed.toString();
  }

  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(normalizedPath, `${RED_FRUIT_ORIGIN}/`).toString();
}

function buildSearchUrl(keyword) {
  const cleaned = String(keyword ?? '').trim();
  return cleaned
    ? buildRedFruitUrl(`/search/${encodeURIComponent(cleaned)}`)
    : buildRedFruitUrl('/search');
}

function getActiveNavigation(urlValue) {
  if (!isWebUrl(urlValue)) {
    return '';
  }

  const url = new URL(urlValue);
  if (url.origin !== RED_FRUIT_ORIGIN) {
    const provider = VIDEO_PROVIDERS.find(({ url: providerUrl }) => {
      return new URL(providerUrl).origin === url.origin;
    });
    return provider ? `provider-${provider.key}` : '';
  }

  if (url.pathname === '/') {
    return 'home';
  }
  if (url.pathname.startsWith('/rank/')) {
    return 'rankings';
  }

  const route = RED_FRUIT_ROUTES.find(({ path }) => path !== '/' && url.pathname.startsWith(path));
  return route ? route.key : '';
}

module.exports = {
  RED_FRUIT_ORIGIN,
  RED_FRUIT_ROUTES,
  VIDEO_PROVIDERS,
  buildRedFruitUrl,
  buildSearchUrl,
  getUrlProtocol,
  getActiveNavigation,
  isWebUrl
};
