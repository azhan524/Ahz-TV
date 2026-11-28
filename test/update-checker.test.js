'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  checkForUpdate,
  compareVersions,
  parseVersion
} = require('../src/update-checker');

test('version comparison handles releases and tags', () => {
  assert.deepEqual(parseVersion('v1.6.0'), [1, 6, 0]);
  assert.equal(compareVersions('v1.7.0', '1.6.9'), 1);
  assert.equal(compareVersions('1.6.0', 'v1.6.0'), 0);
  assert.equal(compareVersions('1.5.9', '1.6.0'), -1);
});

test('update checker reports a newer GitHub release', async () => {
  const result = await checkForUpdate({
    currentVersion: '1.6.0',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        tag_name: 'v1.7.0',
        html_url: 'https://example.test/release',
        name: 'Ahz TV 1.7.0',
        published_at: '2026-12-01T00:00:00Z'
      })
    })
  });

  assert.equal(result.available, true);
  assert.equal(result.latestVersion, '1.7.0');
  assert.equal(result.url, 'https://example.test/release');
});
