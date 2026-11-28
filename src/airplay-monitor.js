'use strict';

function createAirplayHealth() {
  return {
    state: 'stopped',
    listening: false,
    connected: false,
    codec: null,
    width: null,
    height: null,
    advertisedWidth: null,
    advertisedHeight: null,
    lastError: null,
    lastEventAt: null
  };
}

function sanitizeDiagnosticLine(line) {
  return String(line ?? '')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
    .replace(/\[[0-9a-f:]+\]/gi, '[ipv6]')
    .replace(/\b(?:[0-9a-f]{1,4}:){3,}[0-9a-f]{0,4}\b/gi, '[ipv6]')
    .replace(/\b[A-Z]:\\Users\\[^\\\s]+/gi, '[user]')
    .replace(/\bname=[^\s]+/gi, 'name=[device]')
    .trim();
}

function applyAirplayLogLine(health, rawLine) {
  const line = sanitizeDiagnosticLine(rawLine);
  if (!line) return health;

  const now = new Date().toISOString();
  health.lastEventAt = now;

  if (/TCP server listening/i.test(line)) {
    health.state = 'waiting';
    health.listening = true;
  }
  if (/AirPlay session START|mirror: iOS connected/i.test(line)) {
    health.state = 'connected';
    health.connected = true;
  }

  const video = line.match(/mirror video:\s+(H\.264|H\.265|HEVC)[^,]*,\s*(\d+)x(\d+)/i);
  if (video) {
    health.codec = /264/i.test(video[1]) ? 'H.264' : 'HEVC';
    health.width = Number(video[2]);
    health.height = Number(video[3]);
  }

  const advertised = line.match(/Mirror display advertised:\s*(\d+)x(\d+)/i);
  if (advertised) {
    health.advertisedWidth = Number(advertised[1]);
    health.advertisedHeight = Number(advertised[2]);
  }

  if (/Disconnect requested|AirPlay session ended|control read ended|teardown:/i.test(line)) {
    health.state = 'waiting';
    health.connected = false;
    health.codec = null;
    health.width = null;
    health.height = null;
  }
  if (/Failed to start AirPlay server|bind\(.*failed|could not start/i.test(line)) {
    health.state = 'error';
    health.listening = false;
    health.lastError = line;
  }
  return health;
}

module.exports = {
  applyAirplayLogLine,
  createAirplayHealth,
  sanitizeDiagnosticLine
};
