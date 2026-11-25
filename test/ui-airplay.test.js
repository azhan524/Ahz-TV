'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.join(__dirname, '..', 'src', 'renderer', 'index.html');
const rendererPath = path.join(__dirname, '..', 'src', 'renderer', 'app.js');

test('Ahz-Stream panel exposes a clear receiver icon and fullscreen action', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const renderer = fs.readFileSync(rendererPath, 'utf8');

  assert.match(html, /class="phone-step phone-step-airplay"/);
  assert.match(html, /id="connectAirplayFullscreen"/);
  assert.match(html, /id="connectAirplayFullscreenLabel"/);
  assert.match(renderer, /connectAirplayFullscreen\.addEventListener\('click'/);
  assert.match(renderer, /setWindowFullscreen\(true\)/);
});

test('fullscreen exit control is visible and keyboard shortcuts are wired', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const renderer = fs.readFileSync(rendererPath, 'utf8');
  const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

  assert.match(html, /id="exitFullscreenButton"/);
  assert.match(renderer, /exitFullscreenButton\.hidden = !state\.isFullScreen/);
  assert.match(main, /input\.key === 'Escape' && mainWindow\?\.isFullScreen\(\)/);
});

test('Ahz-Stream defaults to the highest supported receiver quality', () => {
  const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

  assert.match(main, /mirror_width: '3840'/);
  assert.match(main, /hevc_enabled: '1'/);
  assert.match(main, /receiver_name', 'Ahz-Stream/);
  assert.match(main, /receiverName: 'Ahz-Stream'/);
});

test('bundled receiver titlebar uses the Ahz-Stream wordmark', () => {
  const binary = fs.readFileSync(
    path.join(__dirname, '..', 'vendor', 'airplay-windows', 'airplay-windows.exe')
  );

  assert.equal(binary.includes(Buffer.from('AirPlay Windows')), false);
  assert.equal(binary.includes(Buffer.from('Ahz-Stream     ')), true);
});
