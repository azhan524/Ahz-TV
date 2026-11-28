'use strict';

function parseVersion(value) {
  const match = String(value ?? '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)/i);
  if (!match) return null;
  return match.slice(1).map(Number);
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] > b[index]) return 1;
    if (a[index] < b[index]) return -1;
  }
  return 0;
}

async function checkForUpdate({
  currentVersion,
  repository = 'azhan524/Ahz-TV',
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000
}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('No fetch implementation available');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(
      `https://api.github.com/repos/${repository}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Ahz-TV-Update-Checker',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: controller.signal
      }
    );
    if (!response.ok) {
      throw new Error(`GitHub release request failed: ${response.status}`);
    }
    const release = await response.json();
    const latestVersion = String(release.tag_name || '').replace(/^v/i, '');
    return {
      available: compareVersions(latestVersion, currentVersion) > 0,
      currentVersion,
      latestVersion,
      url: release.html_url,
      name: release.name || '',
      publishedAt: release.published_at || null
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  checkForUpdate,
  compareVersions,
  parseVersion
};
