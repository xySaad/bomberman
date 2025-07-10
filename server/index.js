import { WebSocketServer } from "ws";
import { createServer } from "http";
import { User } from "./network/user.js";
import { GameState } from "./game/state.js";

const PORT = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  new User(ws);
  console.log("New connection");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});
