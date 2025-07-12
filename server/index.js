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
    player.on("player_move", (data) => {
      console.log(data);
      player.position = { x: data.x, y: data.y };

      game.broadcast({
        type: "player_move",
        nickname: player.nickname,
        x: data.x,
        y: data.y
      });
    });


  player.on("place_bomb", (data) => {
      console.log(`${player.nickname} wants to place bomb at ${data.x}, ${data.y}`);

      if (player.hasBomb) {
        console.log(`${player.nickname} already has a bomb placed`);
        return;
      }
      
      const existingBomb = game.bombs.find(b => b.x === data.x && b.y === data.y);
      if (existingBomb) {
        console.log(`Bomb already exists at position ${data.x}, ${data.y}`);
        return;
      }
      
      const bombId = `${player.nickname}_${data.x}_${data.y}_${Date.now()}`;
      const bomb = {
        id: bombId,
        x: data.x,
        y: data.y,
        owner: player.nickname,
        timer: null
      };
      
      game.bombs.push(bomb);
      player.hasBomb = true;

      game.broadcast({
        type: "bomb_placed",
        nickname: player.nickname,
        x: data.x,
        y: data.y,
        bombId: bombId
      });

      bomb.timer = setTimeout(() => {
        console.log(`Bomb ${bombId} exploded!`);
        const bombIndex = game.bombs.findIndex(b => b.id === bombId);
        if (bombIndex !== -1) {
          game.bombs.splice(bombIndex, 1);
        }
        
        player.hasBomb = false;
        
        game.broadcast({
          type: "bomb_exploded",
          bombId: bombId,
          x: data.x,
          y: data.y
        });
        
      }, 3000); 
      
      console.log(`Bomb ${bombId} placed and will explode in 4 seconds`);
    });


  });

  console.log("New connection");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});
