/**
 * containerManager.js
 *
 * What this does:
 *   When a visitor types "ssh hire-chetan@ubuntu" in the portfolio terminal,
 *   this module spawns a fresh Docker container just for them.
 *   The container is:
 *     - Isolated from the host filesystem (no mounts to real VM dirs)
 *     - Network-disabled (can't phone home or scan your VM's network)
 *     - Memory-limited to 64MB (can't eat your free-tier RAM)
 *     - CPU-throttled to 10% of one core
 *     - PID-limited to 20 processes (prevents fork bombs)
 *     - Running as non-root user "chetan" (uid 2000)
 *     - Read-only root filesystem
 *     - Auto-deleted the moment the user disconnects
 *
 * Even worst case: if someone finds a bash escape,
 *   they're still inside a container with no network,
 *   no root, no write access, 64MB RAM, and it dies on disconnect.
 */

const Docker = require("dockerode");
const { v4: uuidv4 } = require("uuid");

// Connects to Docker via the Unix socket
// The socket is mounted read-write into the server container (see K8s manifest)
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Track active containers: socketId → { container, stream }
const activeSessions = new Map();

const SANDBOX_IMAGE = process.env.SANDBOX_IMAGE || "chetan-sandbox:latest";
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // Auto-kill after 10 minutes

async function spawnSandbox(socketId) {
  if (activeSessions.has(socketId)) {
    return activeSessions.get(socketId);
  }

  const containerName = `portfolio-session-${uuidv4().slice(0, 8)}`;

  const container = await docker.createContainer({
    Image: SANDBOX_IMAGE,
    name: containerName,

    // Interactive TTY — needed for xterm.js ↔ bash
    Tty: true,
    OpenStdin: true,
    StdinOnce: false,

    // Run as non-root user
    User: "chetan",
    WorkingDir: "/home/chetan",

    // Environment
    Env: [
      "TERM=xterm-256color",
      "HOME=/home/chetan",
      "SHELL=/bin/bash",
    ],

    // The actual security constraints
    HostConfig: {
      // ── Memory: 64MB max, no swap ──────────────────────
      Memory: 64 * 1024 * 1024,
      MemorySwap: 64 * 1024 * 1024,  // same as Memory = no swap

      // ── CPU: 10% of one core ───────────────────────────
      CpuQuota: 10000,
      CpuPeriod: 100000,

      // ── Process limit: max 20 PIDs ─────────────────────
      PidsLimit: 20,

      // ── No network: can't reach your VM's other services
      NetworkMode: "none",

      // ── Read-only root filesystem ──────────────────────
      // Container can't write to its own filesystem except /tmp
      ReadonlyRootfs: true,

      // ── Writable /tmp only ─────────────────────────────
      Tmpfs: { "/tmp": "size=8m,noexec,nosuid" },

      // ── Auto-delete when stopped ───────────────────────
      AutoRemove: true,

      // ── Drop ALL Linux capabilities ────────────────────
      // Capabilities let processes do privileged things.
      // We drop everything — no capability to change file perms,
      // load kernel modules, bind low ports, etc.
      CapDrop: ["ALL"],
      CapAdd: [],

      // ── No new privileges ──────────────────────────────
      // Prevents setuid escalation (e.g. via sudo or su binaries)
      SecurityOpt: ["no-new-privileges:true"],

      // ── No host devices ────────────────────────────────
      Devices: [],
    },
  });

  await container.start();

  // Auto-kill after SESSION_TIMEOUT_MS
  const killTimer = setTimeout(() => {
    destroySandbox(socketId).catch(() => {});
  }, SESSION_TIMEOUT_MS);

  activeSessions.set(socketId, { container, containerName, killTimer, stream: null });

  return activeSessions.get(socketId);
}

async function attachToSandbox(socketId) {
  const session = activeSessions.get(socketId);
  if (!session) throw new Error("No session found for " + socketId);

  const { container } = session;

  // Create an exec inside the running container
  const exec = await container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ["/bin/bash", "--login"],
    User: "chetan",
    WorkingDir: "/home/chetan",
    Env: ["TERM=xterm-256color"],
  });

  const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
  session.stream = stream;

  return stream;
}

async function destroySandbox(socketId) {
  const session = activeSessions.get(socketId);
  if (!session) return;

  activeSessions.delete(socketId);
  clearTimeout(session.killTimer);

  // Close the stream
  try { session.stream?.end(); } catch {}

  // Stop container (AutoRemove:true handles deletion)
  try {
    await session.container.stop({ t: 0 }); // force-kill immediately
    console.log(`🗑  Sandbox ${session.containerName} destroyed`);
  } catch (err) {
    if (!err.message?.includes("not running")) {
      console.error(`Error stopping ${session.containerName}:`, err.message);
    }
  }
}

function hasActiveSandbox(socketId) {
  return activeSessions.has(socketId);
}

function getActiveSandboxCount() {
  return activeSessions.size;
}

module.exports = {
  spawnSandbox,
  attachToSandbox,
  destroySandbox,
  hasActiveSandbox,
  getActiveSandboxCount,
};
