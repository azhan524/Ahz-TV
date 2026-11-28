'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyAirplayLogLine,
  createAirplayHealth,
  sanitizeDiagnosticLine
} = require('../src/airplay-monitor');

test('AirPlay health follows listener, stream, and teardown events', () => {
  const health = createAirplayHealth();
  applyAirplayLogLine(health, 'Mirror display advertised: 3840x2160');
  applyAirplayLogLine(health, 'TCP server listening on [::]:7000 (IPv4+IPv6)');
  assert.equal(health.state, 'waiting');
  assert.equal(health.listening, true);
  assert.equal(health.advertisedWidth, 3840);

  applyAirplayLogLine(health, '=== AirPlay session START: device name=[device] ===');
  applyAirplayLogLine(health, 'mirror video: H.264 High level 3.2, 1708x790');
  assert.equal(health.state, 'connected');
  assert.equal(health.connected, true);
  assert.equal(health.codec, 'H.264');
  assert.equal(health.width, 1708);
  assert.equal(health.height, 790);

  applyAirplayLogLine(health, 'teardown: closing session sockets');
  assert.equal(health.state, 'waiting');
  assert.equal(health.connected, false);
  assert.equal(health.width, null);
});

test('diagnostic output removes addresses and device names', () => {
  const cleaned = sanitizeDiagnosticLine(
    'accepted [2408:845d::1]:63869 name=Lz@iPhone from 192.168.1.9'
  );
  assert.equal(cleaned.includes('Lz@iPhone'), false);
  assert.equal(cleaned.includes('192.168.1.9'), false);
  assert.equal(cleaned.includes('2408:845d'), false);
});

test('diagnostic output removes unbracketed IPv6 and user home paths', () => {
  const cleaned = sanitizeDiagnosticLine(
    'mirror: iOS connected from 2408:845d:720:9414:39eb:976e:d134:17f1 C:\\Users\\Ahzhan\\clip.mp4'
  );
  assert.equal(cleaned.includes('2408:845d'), false);
  assert.equal(cleaned.includes('Ahzhan'), false);
});
