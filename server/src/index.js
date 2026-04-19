const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const terminalRoutes = require("./routes/terminal");
const socketHandler = require("./socket/terminalSocket");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/terminal", terminalRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Socket.IO handler
socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
