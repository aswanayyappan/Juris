const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(repoRoot, '..', 'frontend');

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (res.status !== 0) process.exit(res.status);
}

if (process.env.NODE_ENV === 'production') {
  console.log('[start-with-frontend] NODE_ENV=production — building frontend');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run(npmCmd, ['install', '--no-audit'], frontendDir);
  run(npmCmd, ['run', 'build'], frontendDir);
} else {
  console.log('[start-with-frontend] NODE_ENV!=production — skipping frontend build');
}

// start backend
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';
run(nodeCmd, ['src/index.js'], repoRoot);
