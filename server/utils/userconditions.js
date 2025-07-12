export function canMoveTo(map, x, y) {
  if (!map[y] || map[y][x] === undefined) return false;
  return map[y][x] === 1; 
}



export function hasBombAt(bombs, x, y) {
  return bombs.find(bomb => bomb.x === x && bomb.y === y) !== undefined;
}


export function handleBombPlacement(game, player, x, y) {

  if (player.hasBomb) return;
  

  const existingBomb = game.bombs.find(b => b.x === x && b.y === y);
  if (existingBomb) return;


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
      
    }
    
  }, 3000);
}


export function handlePlayerInput(game, player, input) {
  const { x, y } = player.position;
  switch (input) {
    case "ArrowUp":
      handlePlayerMovement(game, player, x, y - 1);
      break;
    case "ArrowDown":
      handlePlayerMovement(game, player, x, y + 1);
      break;
    case "ArrowLeft":
      handlePlayerMovement(game, player, x - 1, y);
      break;
    case "ArrowRight":
      handlePlayerMovement(game, player, x + 1, y);
      break;
    case "Space":
      handleBombPlacement(game, player, x, y);
      break;
    default:
      console.log(`Unknown: ${input}`);
      return;
  }
}
function handlePlayerMovement(game, player, nextX, nextY) {
  if (canMoveTo(game.map, nextX, nextY)) {
    if (!hasBombAt(game.bombs, nextX, nextY)) {
      player.position = { x: nextX, y: nextY };
      game.broadcast({
        type: "player_move",
        nickname: player.nickname,
        x: nextX,
        y: nextY
      });
    }
  }
}

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