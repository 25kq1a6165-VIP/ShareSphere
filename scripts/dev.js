import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log(`\n======================================================================`);
console.log(`🚀 Starting ShareSphere Full-Stack Development Environment`);
console.log(`📡 Backend:  http://localhost:5000`);
console.log(`💻 Frontend: http://localhost:5173`);
console.log(`======================================================================\n`);

// 1. Start backend server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../server'),
  stdio: 'inherit',
  shell: true,
});

// 2. Start frontend client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../client'),
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  console.log('\nStopping ShareSphere servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});
