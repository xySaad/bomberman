import { WebSocketServer } from "ws";
import { createServer } from "http";
import { User } from "./network/user.js";
import { GamePool } from "./game/pool.js";

const PORT = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });
const gamePool = new GamePool();

wss.on("connection", (ws) => {
  const user = new User(ws);
  user.on("register", (data) => {
    const game = gamePool.lookup();
    const player = game.addPlayer(user, data.nickname);
    console.log("logged in as", player.nickname);
    player.cleanup = () => game.deletePlayer(player);
    player.on("chat", (data) => {
      game.broadcast({
        type: "chat",
        nickname: player.nickname,
        message: data.message,
      });
    });
  });

  console.log("New connection");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});
