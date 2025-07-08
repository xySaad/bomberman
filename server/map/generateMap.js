export const WIDTH = 15;
export const HEIGHT = 15;

const isCornerSpawnZone = (x, y) => {
  const inTopLeft = x < 3 && y < 3;
  const inTopRight = x > WIDTH - 4 && y < 3;
  const inBottomLeft = x < 3 && y > HEIGHT - 4;
  const inBottomRight = x > WIDTH - 4 && y > HEIGHT - 4;
  return inTopLeft || inTopRight || inBottomLeft || inBottomRight;
};

export const generateMap = () => {
  const map = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) {
        row.push(0); // wall
      } else if (isCornerSpawnZone(x, y)) {
        row.push(1); // ground
      } else if (x % 2 === 0 && y % 2 === 0) {
        row.push(3); // unbreakable box
      } else {
        row.push(Math.random() < 0.7 ? 2 : 1); // box or ground
      }
    }
    map.push(row);
  }
  return map;
};
