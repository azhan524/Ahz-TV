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

test('projection view exposes persistent adaptive framing controls', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const renderer = fs.readFileSync(rendererPath, 'utf8');

  assert.match(html, /id="projectionFrameMenu"/);
  assert.match(html, /data-frame-mode="auto"/);
  assert.match(html, /data-frame-mode="contain"/);
  assert.match(html, /data-frame-mode="cover"/);
  assert.match(renderer, /ahz-tv:projection-frame/);
  assert.match(renderer, /Math\.abs\(Math\.log\(sourceRatio \/ targetRatio\)\) <= 0\.16/);
});

test('capture source matching recognizes the renamed Ahz-Stream window', () => {
  const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

  assert.match(main, /ahz\[\\s-\]\*stream/);
});

test('receiver quality presets use readable labels and default to original', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const renderer = fs.readFileSync(rendererPath, 'utf8');
  const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

  for (const label of ['480p', '720p', '1080p', '1.5K', '2K', '4K', '8K', '原画（推荐）']) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /value="original" selected/);
  assert.match(renderer, /ahz-tv:airplay-quality/);
  assert.match(main, /'8k': \{ width: 7680, height: 4320 \}/);
  assert.match(main, /original: \{ width: 3840, height: 2160 \}/);
});

test('receiver UI exposes health details and sanitized diagnostic export', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const renderer = fs.readFileSync(rendererPath, 'utf8');
  const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
  const preload = fs.readFileSync(path.join(__dirname, '..', 'src', 'preload.js'), 'utf8');

  assert.match(html, /id="airplayExtensionDetail"/);
  assert.match(html, /id="exportAirplayDiagnostics"/);
  assert.match(renderer, /端口 7000 已监听/);
  assert.match(renderer, /listCaptureSources\(\)/);
  assert.match(main, /airplay:export-diagnostics/);
  assert.match(main, /Port 7000 did not open; restarting once/);
  assert.match(preload, /exportAirplayDiagnostics/);
});
