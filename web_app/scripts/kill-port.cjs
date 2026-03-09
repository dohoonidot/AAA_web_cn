/**
 * Kill process(es) listening on a TCP port.
 *
 * Usage:
 *   node scripts/kill-port.cjs 5173
 *
 * - Windows: uses `netstat -ano -p tcp` + `taskkill /PID <pid> /F`
 * - macOS/Linux: uses `lsof -ti tcp:<port>` (if available) + `kill -9`
 */
const { execSync } = require('node:child_process');

const port = Number(process.argv[2]);
if (!Number.isFinite(port) || port <= 0) {
  console.error('[kill-port] Invalid port. Usage: node scripts/kill-port.cjs 5173');
  process.exit(1);
}

function sh(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
}

function killWindows(p) {
  let out = '';
  try {
    out = sh(`netstat -ano -p tcp`);
  } catch (e) {
    console.warn('[kill-port] netstat failed:', e?.message || e);
    return;
  }

  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    // Example:
    // TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING       12345
    if (!line.includes('LISTENING')) continue;
    if (!line.includes(`:${p}`)) continue;

    const parts = line.trim().split(/\s+/);
    const pidStr = parts[parts.length - 1];
    const pid = Number(pidStr);
    if (Number.isFinite(pid) && pid > 0) pids.add(pid);
  }

  if (pids.size === 0) {
    console.log(`[kill-port] Port ${p} is free.`);
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[kill-port] Killed PID ${pid} (port ${p}).`);
    } catch (e) {
      console.warn(`[kill-port] Failed to kill PID ${pid}:`, e?.message || e);
    }
  }
}

function killPosix(p) {
  let pids = [];
  try {
    const out = sh(`lsof -ti tcp:${p}`);
    pids = out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    // lsof not installed or nothing listening
    console.log(`[kill-port] Port ${p} is free (or lsof unavailable).`);
    return;
  }

  if (pids.length === 0) {
    console.log(`[kill-port] Port ${p} is free.`);
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`[kill-port] Killed PID ${pid} (port ${p}).`);
    } catch (e) {
      console.warn(`[kill-port] Failed to kill PID ${pid}:`, e?.message || e);
    }
  }
}

if (process.platform === 'win32') {
  killWindows(port);
} else {
  killPosix(port);
}

