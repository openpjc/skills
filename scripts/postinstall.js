const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const TOOLS = [
  { name: 'Claude Code', skillsDir: path.join(os.homedir(), '.claude', 'skills') },
  { name: 'Codex', skillsDir: path.join(os.homedir(), '.codex', 'skills') },
  { name: 'Trae', skillsDir: path.join(os.homedir(), '.trae', 'skills') },
  { name: 'Trae CN', skillsDir: path.join(os.homedir(), '.trae-cn', 'skills') },
];

function detectTools() {
  return TOOLS.filter(tool => {
    try {
      return fs.statSync(tool.skillsDir).isDirectory();
    } catch {
      return false;
    }
  });
}

function createSymlinks(tools) {
  const skillsRoot = path.resolve(__dirname, '..', 'skills');
  const skillDirs = fs.readdirSync(skillsRoot).filter(d => d.startsWith('sx-'));
  const results = [];

  for (const tool of tools) {
    for (const skill of skillDirs) {
      const src = path.join(skillsRoot, skill);
      const dest = path.join(tool.skillsDir, skill);
      try {
        const existing = fs.lstatSync(dest);
        if (existing.isSymbolicLink() && fs.readlinkSync(dest) === src) {
          results.push({ tool: tool.name, skill, status: 'skipped' });
          continue;
        }
        fs.rmSync(dest, { recursive: true });
      } catch {}
      fs.symlinkSync(src, dest);
      results.push({ tool: tool.name, skill, status: 'created' });
    }
  }
  return results;
}

if (require.main === module) {
  const tools = detectTools();
  if (tools.length === 0) {
    console.log('No supported AI tools detected. Skipping skill installation.');
    process.exit(0);
  }
  const results = createSymlinks(tools);
  console.log('Skills installed:');
  for (const r of results) {
    const icon = r.status === 'created' ? '+' : '=';
    console.log(`  [${icon}] ${r.skill} -> ${r.tool}`);
  }
}

module.exports = { detectTools, createSymlinks };
