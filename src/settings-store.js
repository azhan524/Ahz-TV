'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SETTINGS_SCHEMA_VERSION = 1;
const AIRPLAY_QUALITIES = new Set([
  '480p',
  '720p',
  '1080p',
  '1.5k',
  '2k',
  '4k',
  '8k',
  'original'
]);
const FRAME_MODES = new Set(['auto', 'contain', 'cover']);

const DEFAULT_SETTINGS = Object.freeze({
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  airplay: Object.freeze({
    quality: 'original',
    frameMode: 'auto'
  }),
  player: Object.freeze({
    frameMode: 'auto'
  })
});

function normalizeSettings(value = {}) {
  const airplay = value?.airplay && typeof value.airplay === 'object'
    ? value.airplay
    : {};
  const player = value?.player && typeof value.player === 'object'
    ? value.player
    : {};

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    airplay: {
      quality: AIRPLAY_QUALITIES.has(airplay.quality)
        ? airplay.quality
        : DEFAULT_SETTINGS.airplay.quality,
      frameMode: FRAME_MODES.has(airplay.frameMode)
        ? airplay.frameMode
        : DEFAULT_SETTINGS.airplay.frameMode
    },
    player: {
      frameMode: FRAME_MODES.has(player.frameMode)
        ? player.frameMode
        : DEFAULT_SETTINGS.player.frameMode
    }
  };
}

function mergeSettings(current, patch = {}) {
  const candidate = structuredClone(normalizeSettings(current));
  if (AIRPLAY_QUALITIES.has(patch?.airplay?.quality)) {
    candidate.airplay.quality = patch.airplay.quality;
  }
  if (FRAME_MODES.has(patch?.airplay?.frameMode)) {
    candidate.airplay.frameMode = patch.airplay.frameMode;
  }
  if (FRAME_MODES.has(patch?.player?.frameMode)) {
    candidate.player.frameMode = patch.player.frameMode;
  }
  return normalizeSettings(candidate);
}

class SettingsStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.settings = this.load();
  }

  load() {
    try {
      return normalizeSettings(JSON.parse(fs.readFileSync(this.filePath, 'utf8')));
    } catch {
      const settings = normalizeSettings();
      this.save(settings);
      return settings;
    }
  }

  get() {
    return structuredClone(this.settings);
  }

  update(patch) {
    this.settings = mergeSettings(this.settings, patch);
    this.save(this.settings);
    return this.get();
  }

  save(settings) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  }
}

module.exports = {
  AIRPLAY_QUALITIES,
  DEFAULT_SETTINGS,
  FRAME_MODES,
  SettingsStore,
  SETTINGS_SCHEMA_VERSION,
  mergeSettings,
  normalizeSettings
};
