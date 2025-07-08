import { WebSocketServer } from "ws";
import { createServer } from "http";
import { handleWsMessage } from "./message_handling/index.js";
import { GameMap } from "./map/generateMap.js";

const PORT = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });
const map = new GameMap(15, 15);
const gameMap = map.generate();
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
  ws.send(
    JSON.stringify({
      type: "game_map",
      map: gameMap,
    })
  );
  ws.on("message", (raw) => {
    const data = JSON.parse(raw);
    const reply = handleWsMessage(ws, data);
    broadcast(reply);
  });

  ws.on("close", () => {
    const user = clients.get(ws);
    clients.delete(ws);
    console.log(`Disconnected: ${user.nickname}`);
  });
});

server.listen(PORT, () => {
  console.log(
    `🚀 Bomberman WebSocket server running on ws://localhost:${PORT}`
  );
});
