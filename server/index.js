import { WebSocketServer } from "ws";
import { createServer } from "http";
import { User } from "./user.js";
const PORT = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });
export const GameState = {
  maxPlayers: 4,
  
};
wss.on("connection", (ws) => {
  const user = new User(ws);
  console.log("New connection");
});

server.listen(PORT, () => {
  console.log(
    `🚀 Bomberman WebSocket server running on ws://localhost:${PORT}`
  );
});
