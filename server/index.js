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
    if (player === null) return;
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

      const bombId = `bomb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const bomb = {
        id: bombId,
        x: data.x,
        y: data.y,
        owner: player.nickname,
        timer: null,
        exploded: false
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
          const explodedBomb = game.bombs[bombIndex];
          explodedBomb.exploded = true; 
          game.bombs.splice(bombIndex, 1);

          player.hasBomb = false;

          // Calculate explosion pattern
          const explosionData = calculateExplosion(game.map, explodedBomb.x, explodedBomb.y);
          
          // Update the map by destroying boxes
          explosionData.destroyedBoxes.forEach(box => {
            game.map[box.y][box.x] = 1; // Change box to ground
          });

          game.broadcast({
            type: "bomb_exploded",
            bombId: bombId,
            x: explodedBomb.x,
            y: explodedBomb.y,
            owner: explodedBomb.owner,
            explosionDirections: explosionData.directions,
            destroyedBoxes: explosionData.destroyedBoxes
          });
          
        } else {
          console.warn(`Bomb ${bombId} not found during explosion`);
        }
        
      }, 3000);

      console.log(`Bomb ${bombId} placed and will explode in 4 seconds`);
    });


  });

  console.log("New connection");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});


function calculateExplosion(map, bombX, bombY, explosionRange = 1) {
  const directions = [];
  const destroyedBoxes = [];
  
  // Define the four directions: up, down, left, right
  const directionVectors = [
    { dx: 0, dy: -1, name: 'up' },    // up
    { dx: 0, dy: 1, name: 'down' },   // down
    { dx: -1, dy: 0, name: 'left' },  // left
    { dx: 1, dy: 0, name: 'right' }   // right
  ];

  directionVectors.forEach(direction => {
    const explosionPath = [];
    let canExplode = true;
    
    for (let i = 1; i <= explosionRange && canExplode; i++) {
      const x = bombX + (direction.dx * i);
      const y = bombY + (direction.dy * i);
      
      // Check if coordinates are within map bounds
      if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
        canExplode = false;
        break;
      }
      
      const cellType = map[y][x];
      
      switch (cellType) {
        case 0: // Wall - stop explosion
        case 3: // Unbreakable - stop explosion
          canExplode = false;
          break;
        case 1: // Ground - explosion continues
          explosionPath.push({ x, y });
          break;
        case 2: // Box - destroy it and stop explosion
          explosionPath.push({ x, y });
          destroyedBoxes.push({ x, y });
          canExplode = false;
          break;
        default:
          canExplode = false;
          break;
      }
    }
    
    if (explosionPath.length > 0) {
      directions.push({
        direction: direction.name,
        cells: explosionPath
      });
    }
  });

  return {
    directions,
    destroyedBoxes
  };
}