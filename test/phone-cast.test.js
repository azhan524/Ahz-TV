'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  isPrivateAddress,
  mediaKindFor,
  sanitizeFileName,
  startPhoneCast,
  stopPhoneCast
} = require('../src/phone-cast');

test('private network validation accepts LAN addresses only', () => {
  assert.equal(isPrivateAddress('192.168.1.25'), true);
  assert.equal(isPrivateAddress('10.0.0.4'), true);
  assert.equal(isPrivateAddress('172.20.1.4'), true);
  assert.equal(isPrivateAddress('::ffff:192.168.137.2'), true);
  assert.equal(isPrivateAddress('8.8.8.8'), false);
  assert.equal(isPrivateAddress('203.0.113.10'), false);
});

test('phone file names and media types are sanitized', () => {
  assert.equal(sanitizeFileName('../../family photo.jpg'), 'family photo.jpg');
  assert.equal(sanitizeFileName('bad:name?.mov'), 'bad_name_.mov');
  assert.equal(mediaKindFor('clip.mp4', ''), 'video');
  assert.equal(mediaKindFor('photo.JPG', ''), 'image');
  assert.equal(mediaKindFor('notes.txt', 'text/plain'), '');
});

test('phone cast server serves its page and receives a private-LAN upload', async (context) => {
  const uploadDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ahz-tv-phone-cast-'));
  const received = [];
  const info = await startPhoneCast({
    uploadDirectory,
    onMedia: (media) => received.push(media)
  });

  context.after(async () => {
    await stopPhoneCast();
    await fs.promises.rm(uploadDirectory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${info.port}`;
  const refreshedInfo = await startPhoneCast({});
  assert.equal(refreshedInfo.port, info.port);
  assert.equal(refreshedInfo.token, info.token);
  assert.ok(Array.isArray(refreshedInfo.addresses));

  const pageResponse = await fetch(`${baseUrl}/?token=${info.token}`);
  assert.equal(pageResponse.status, 200);
  assert.match(await pageResponse.text(), /手机投送/);

  const payload = Buffer.from('ahz-tv-phone-test');
  const uploadResponse = await fetch(
    `${baseUrl}/api/upload?token=${info.token}&name=test-image.png&type=image%2Fpng`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload
    }
  );

  assert.equal(uploadResponse.status, 200);
  assert.equal(received.length, 1);
  assert.equal(received[0].name, 'test-image.png');
  assert.equal(received[0].kind, 'image');
  assert.deepEqual(await fs.promises.readFile(received[0].path), payload);
});
