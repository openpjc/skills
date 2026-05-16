const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const { detectTools, createSymlinks } = require('../scripts/postinstall.js');

describe('detectTools', () => {
  test('returns tools whose skills directory exists', () => {
    const tools = detectTools();
    assert(Array.isArray(tools));
    for (const tool of tools) {
      assert(typeof tool.name === 'string');
      assert(typeof tool.skillsDir === 'string');
      assert(fs.existsSync(tool.skillsDir));
    }
  });
});

describe('createSymlinks', () => {
  test('creates symlink in target directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sx-test-'));
    const skillSrc = path.resolve(__dirname, '../skills/sx-git-acp');
    const results = createSymlinks([{ name: 'test', skillsDir: tmpDir }]);
    const link = path.join(tmpDir, 'sx-git-acp');
    assert(fs.existsSync(link));
    assert(fs.lstatSync(link).isSymbolicLink());
    assert.strictEqual(fs.readlinkSync(link), skillSrc);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('skips if symlink already exists and points correctly', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sx-test-'));
    const skillSrc = path.resolve(__dirname, '../skills/sx-git-acp');
    fs.symlinkSync(skillSrc, path.join(tmpDir, 'sx-git-acp'));
    const results = createSymlinks([{ name: 'test', skillsDir: tmpDir }]);
    assert(results.some(r => r.status === 'skipped'));
    fs.rmSync(tmpDir, { recursive: true });
  });
});
