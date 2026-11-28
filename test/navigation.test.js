'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RED_FRUIT_ORIGIN,
  buildRedFruitUrl,
  buildSearchUrl,
  getUrlProtocol,
  getActiveNavigation,
  isWebUrl
} = require('../src/navigation');

test('buildRedFruitUrl resolves normal paths', () => {
  assert.equal(buildRedFruitUrl('/category/comic-drama'), `${RED_FRUIT_ORIGIN}/category/comic-drama`);
  assert.equal(buildRedFruitUrl('rank/hot-drama'), `${RED_FRUIT_ORIGIN}/rank/hot-drama`);
});

test('buildRedFruitUrl rejects other origins', () => {
  assert.throws(() => buildRedFruitUrl('https://example.com/video'), /Only red-fruit URLs/);
});

test('search URLs encode Chinese and reserved characters', () => {
  assert.equal(
    buildSearchUrl(' 霸总 & 穿越 '),
    `${RED_FRUIT_ORIGIN}/search/${encodeURIComponent('霸总 & 穿越')}`
  );
  assert.equal(buildSearchUrl('   '), `${RED_FRUIT_ORIGIN}/search`);
});

test('web URL validation only accepts HTTP and HTTPS', () => {
  assert.equal(isWebUrl('https://hongguoduanju.com/'), true);
  assert.equal(isWebUrl('http://example.com/'), true);
  assert.equal(isWebUrl('javascript:alert(1)'), false);
  assert.equal(isWebUrl('file:///C:/Windows/System32/calc.exe'), false);
  assert.equal(isWebUrl('bitbrowser://profile/123'), false);
  assert.equal(isWebUrl('douyin://user/profile'), false);
  assert.equal(isWebUrl('not a url'), false);
  assert.equal(getUrlProtocol('bitbrowser://profile/123'), 'bitbrowser');
  assert.equal(getUrlProtocol('https://hongguoduanju.com/'), 'https');
});

test('active navigation follows red-fruit categories and providers', () => {
  assert.equal(getActiveNavigation(`${RED_FRUIT_ORIGIN}/`), 'home');
  assert.equal(getActiveNavigation(`${RED_FRUIT_ORIGIN}/category/real-drama`), 'real-drama');
  assert.equal(getActiveNavigation(`${RED_FRUIT_ORIGIN}/category/comic-drama`), 'comic-drama');
  assert.equal(getActiveNavigation(`${RED_FRUIT_ORIGIN}/category/ai-drama`), 'ai-drama');
  assert.equal(getActiveNavigation(`${RED_FRUIT_ORIGIN}/rank/hot-drama`), 'rankings');
  assert.equal(getActiveNavigation('https://www.bilibili.com/anime/'), 'provider-bilibili');
  assert.equal(getActiveNavigation('https://archive.org/details/feature_films'), 'provider-archive');
  assert.equal(getActiveNavigation('https://studio.blender.org/films/'), 'provider-blender');
  assert.equal(getActiveNavigation('https://example.com/'), '');
});
