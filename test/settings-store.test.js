'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  SettingsStore,
  mergeSettings,
  normalizeSettings
} = require('../src/settings-store');

test('settings normalize invalid values to safe defaults', () => {
  assert.deepEqual(normalizeSettings({
    airplay: { quality: 'not-a-quality', frameMode: 'stretch' },
    player: { frameMode: 'cover' }
  }), {
    schemaVersion: 1,
    airplay: { quality: 'original', frameMode: 'auto' },
    player: { frameMode: 'cover' }
  });
});

test('settings merge only accepts known quality and frame values', () => {
  const merged = mergeSettings({
    airplay: { quality: '1080p', frameMode: 'auto' },
    player: { frameMode: 'contain' }
  }, {
    airplay: { quality: '8k', frameMode: 'cover' },
    player: { frameMode: 'unknown' }
  });

  assert.equal(merged.airplay.quality, '8k');
  assert.equal(merged.airplay.frameMode, 'cover');
  assert.equal(merged.player.frameMode, 'contain');
});

test('settings store creates, persists, and reloads JSON settings', async (context) => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ahz-settings-'));
  const filePath = path.join(directory, 'settings.json');
  context.after(() => fs.promises.rm(directory, { recursive: true, force: true }));

  const store = new SettingsStore(filePath);
  assert.equal(store.get().airplay.quality, 'original');

  store.update({ airplay: { quality: '2k', frameMode: 'contain' } });
  const reloaded = new SettingsStore(filePath);
  assert.deepEqual(reloaded.get().airplay, {
    quality: '2k',
    frameMode: 'contain'
  });
});
