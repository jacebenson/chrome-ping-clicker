const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const pkg = require('../package.json');
const manifest = require('../src/manifest.json');

test('extension manifest references shipped files and current version', () => {
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.manifest_version, 3);
  const files = [manifest.action.default_popup, ...Object.values(manifest.icons),
    ...manifest.content_scripts.flatMap(script => script.js)];
  for (const name of files) assert.ok(fs.statSync(path.join('src', name.replace(/^\//, ''))).isFile(), name);
});

test('built distribution contains the actual manifest and popup', () => {
  const zip = fs.readFileSync(`dist/${pkg.name}-${pkg.version}.zip`);
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(end >= 0, 'ZIP end record');
  const count = zip.readUInt16LE(end + 10);
  let offset = zip.readUInt32LE(end + 16);
  const contents = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(zip.readUInt32LE(offset), 0x02014b50);
    const length = zip.readUInt16LE(offset + 28);
    const name = zip.toString('utf8', offset + 46, offset + 46 + length);
    const method = zip.readUInt16LE(offset + 10);
    const size = zip.readUInt32LE(offset + 20);
    const local = zip.readUInt32LE(offset + 42);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const bytes = zip.subarray(start, start + size);
    contents.set(name, method === 8 ? zlib.inflateRawSync(bytes) : bytes);
    offset += 46 + length + zip.readUInt16LE(offset + 30) + zip.readUInt16LE(offset + 32);
  }
  assert.deepEqual(JSON.parse(contents.get('manifest.json').toString()), manifest);
  assert.deepEqual(contents.get('popup.html'), fs.readFileSync('src/popup.html'));
  assert.ok(contents.get('images/icon.png').length > 0);
});

test('published landing page is present', () => {
  const html = fs.readFileSync('docs/index.html', 'utf8');
  assert.match(html, /<html/i);
  assert.match(html, /Ping/i);
});
