import { WebSocketServer } from "ws";
import { createServer } from "http";
import { handleWsMessage } from "./message_handling/index.js";

const PORT = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });

export const clients = new Map();
const getPlayersList = () => {
  return Array.from(clients.values()).map((player) => player);
};

const broadcast = (msg) => {
  clients.forEach((_, ws) => {
    ws.send(JSON.stringify(msg));
  });
};

wss.on("connection", (ws) => {
  console.log("New connection");

  ws.send(
    JSON.stringify({
      type: "players_list",
      players: getPlayersList(),
    })
  );

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);
    const reply = handleWsMessage(ws, data);
    broadcast(reply);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Disconnected: ${user.nickname}`);
  });
});

server.listen(PORT, () => {
  console.log(
    `🚀 Bomberman WebSocket server running on ws://localhost:${PORT}`
  );
});
