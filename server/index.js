import { WebSocketServer } from "ws";
import { createServer } from "http";
import { User } from "./network/user.js";
import { GamePool } from "./game/pool.js";
import { canMoveTo, hasBombAt } from "./utils/userconditions.js";

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
     player.on("player_input", (data) => {
      console.log(`${player.nickname} input:`, data.input);
      
      let { x, y } = player.position;
      let nextX = x;
      let nextY = y;
      let shouldMove = false;

      switch (data.input) {
        case "ArrowUp":
          console.log("mmmmmmmmmmmmmmmmmmmmmm");
          
          nextY -= 1;
          shouldMove = true;
          break;
        case "ArrowDown":
          nextY += 1;
          shouldMove = true;
          break;
        case "ArrowLeft":
          nextX -= 1;
          shouldMove = true;
          break;
        case "ArrowRight":
          nextX += 1;
          shouldMove = true;
          break;
        case "Space":
          console.log(`${player.nickname}  place bomb at ${x}, ${y}`);
          handleBombPlacement(game, player, x, y);
          break;
        default:
          console.log(`Unknwn: ${data.input}`);
          return;
      }

      if (shouldMove) {
       
        if (canMoveTo(game.map, nextX, nextY)) {
       
          if (!hasBombAt(game.bombs, nextX, nextY)) {
         
            player.position = { x: nextX, y: nextY };

            game.broadcast({
              type: "player_move",
              nickname: player.nickname,
              x: nextX,
              y: nextY
            });
            
            console.log(`${player.nickname} moved to:`, nextX, nextY);
          } else {
            console.log(`${player.nickname} cannot move to position with bomb:`, nextX, nextY);
          }
        } else {
          console.log(`${player.nickname} blocked move to:`, nextX, nextY);
        }
      }
    });

  player.on("place_bomb", (data) => {
      handleBombPlacement(game, player, data.x, data.y);
    });


  });

  console.log("New connection");
});
function handleBombPlacement(game, player, x, y) {
  console.log(`${player.nickname} wants to place bomb at ${x}, ${y}`);

  if (player.hasBomb) {
    console.log(`${player.nickname} already has a bomb placed`);
    return;
  }

  const existingBomb = game.bombs.find(b => b.x === x && b.y === y);
  if (existingBomb) {
    console.log(`Bomb already exists at position ${x}, ${y}`);
    return;
  }

  const bombId = `bomb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const bomb = {
    id: bombId,
    x: x,
    y: y,
    owner: player.nickname,
    timer: null,
    exploded: false
  };
  game.bombs.push(bomb);
  player.hasBomb = true;

  game.broadcast({
    type: "bomb_placed",
    nickname: player.nickname,
    x: x,
    y: y,
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

      const explosionData = calculateExplosion(game.map, explodedBomb.x, explodedBomb.y);

      explosionData.destroyedBoxes.forEach(box => {
        game.map[box.y][box.x] = 1; 
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

  console.log(`Bomb ${bombId} placed and will explode in 3 seconds`);
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on ws://localhost:${PORT}`);
});


function calculateExplosion(map, bombX, bombY, explosionRange = 1) {
  const directions = [];
  const destroyedBoxes = [];

  const directionVectors = [
    { dx: 0, dy: -1, name: 'up' },  
    { dx: 0, dy: 1, name: 'down' },  
    { dx: -1, dy: 0, name: 'left' }, 
    { dx: 1, dy: 0, name: 'right' } 
  ];

  directionVectors.forEach(direction => {
    const explosionPath = [];
    let canExplode = true;
    
    for (let i = 1; i <= explosionRange && canExplode; i++) {
      const x = bombX + (direction.dx * i);
      const y = bombY + (direction.dy * i);
      if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
        canExplode = false;
        break;
      }
      
      const cellType = map[y][x];
      
      switch (cellType) {
        case 0:
        case 3: 
          canExplode = false;
          break;
        case 1:
          explosionPath.push({ x, y });
          break;
        case 2: 
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