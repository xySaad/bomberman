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
  const joinGame = (data) => {
    const game = gamePool.lookup();
    const player = game.createPlayer(user, data.nickname);
    if (player === null) return;
    user.on("register", () => {
      player.destroy();
      const newGame = joinGame({ nickname: player.nickname });
    });
    console.log("logged in as", player.nickname);

    user.on("chat", (data) => {
      const chatMessage = {
        type: "chat",
        nickname: player.nickname,
        message: data.message,
      };
      game.broadcast(chatMessage);
      game.chatMessages.push({
        nickname: player.nickname,
        message: data.message,
      });
    });
    return game;
  };
  user.on("register", joinGame);
  console.log("New connection");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});