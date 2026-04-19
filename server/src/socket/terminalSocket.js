const { processCommand }  = require("../commands/processor");
const { welcomeBanner }   = require("../data/profile");
const {
  spawnSandbox, attachToSandbox, destroySandbox,
  hasActiveSandbox, getActiveSandboxCount,
} = require("../docker/containerManager");

const MAX_CONCURRENT_SANDBOXES = 5;
const sandboxSessions = new Map(); // socketId → { stream }

module.exports = function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);
    socket.emit("output", welcomeBanner + "\r\n");

    socket.on("command", async (cmd) => {
      try {
        if (sandboxSessions.has(socket.id)) return;
        const result = processCommand(cmd);
        if (result === "__CLEAR__")           { socket.emit("clear"); return; }
        if (result === "__DOWNLOAD_RESUME__") { socket.emit("download_resume"); socket.emit("output", "\r\n\x1b[32m📄 Resume download started…\x1b[0m\r\n"); return; }
        if (result === "__SPAWN_SANDBOX__")   { await handleSandbox(socket); return; }
        if (result) socket.emit("output", "\r\n" + result + "\r\n");
      } catch (err) {
        console.error(err);
        socket.emit("output", "\r\n\x1b[31mError\x1b[0m\r\n");
      }
    });

    socket.on("input", (data) => {
      const s = sandboxSessions.get(socket.id);
      s?.stream?.write(data);
    });

    socket.on("disconnect", async () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      sandboxSessions.delete(socket.id);
      await destroySandbox(socket.id);
    });
  });

  async function handleSandbox(socket) {
    if (getActiveSandboxCount() >= MAX_CONCURRENT_SANDBOXES) {
      socket.emit("output", "\r\n\x1b[33m⚠  All sandbox slots busy. Try again shortly.\x1b[0m\r\n");
      return;
    }
    socket.emit("output", "\r\n\x1b[90m[Spawning isolated container…]\x1b[0m\r\n");
    try {
      await spawnSandbox(socket.id);
      const stream = await attachToSandbox(socket.id);
      sandboxSessions.set(socket.id, { stream });
      socket.emit("ssh_connected");
      socket.emit("output", "\x1b[1;32m[Connected — isolated sandbox]\x1b[0m\r\n");

      stream.on("data", (chunk) => socket.emit("output", chunk.toString()));
      stream.on("end", () => {
        socket.emit("output", "\r\n\x1b[33m[Session ended]\x1b[0m\r\n");
        socket.emit("ssh_disconnected");
        sandboxSessions.delete(socket.id);
        destroySandbox(socket.id).catch(() => {});
      });
    } catch (err) {
      console.error("Sandbox error:", err.message);
      socket.emit("output", "\r\n\x1b[33m[Sandbox unavailable — running in basic mode]\x1b[0m\r\n");
    }
  }
};
