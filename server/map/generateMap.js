export const WIDTH = 15;
export const HEIGHT = 15;

const isSpawnGround = (x, y) => {
  return (
    // Top-left corner (1,1), (1,2), (2,1)
    (x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1) ||
    // Top-right corner (WIDTH-2,1), (WIDTH-3,1), (WIDTH-2,2)
    (x === WIDTH - 2 && y === 1) || (x === WIDTH - 3 && y === 1) || (x === WIDTH - 2 && y === 2) ||
    // Bottom-left corner (1,HEIGHT-2), (1,HEIGHT-3), (2,HEIGHT-2)
    (x === 1 && y === HEIGHT - 2) || (x === 1 && y === HEIGHT - 3) || (x === 2 && y === HEIGHT - 2) ||
    // Bottom-right corner (WIDTH-2,HEIGHT-2), (WIDTH-3,HEIGHT-2), (WIDTH-2,HEIGHT-3)
    (x === WIDTH - 2 && y === HEIGHT - 2) || (x === WIDTH - 3 && y === HEIGHT - 2) || (x === WIDTH - 2 && y === HEIGHT - 3)
  );
};

export const generateMap = () => {
  const map = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) {
        row.push(0); // Wall
      } else if (isSpawnGround(x, y)) {
        row.push(1); // Reserved spawn ground
      } else if (x % 2 === 0 && y % 2 === 0) {
        row.push(3); // Unbreakable box
      } else {
        row.push(Math.random() < 0.7 ? 2 : 1); // 70% chance for box (2), else ground (1)
      }
    }
    map.push(row);
  }
  return map;
};
