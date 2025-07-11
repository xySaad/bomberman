export class GameMap {
  constructor(width = 15, height = 15) {
    this.width = width;
    this.height = height;
  }

  isCorner(x, y) {
    const w = this.width;
    const h = this.height;
    return (
      // Top-left corner (1,1), (1,2), (2,1)
      (x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1) ||
      // Top-right corner
      (x === w - 2 && y === 1) || (x === w - 3 && y === 1) || (x === w - 2 && y === 2) ||
      // Bottom-left corner
      (x === 1 && y === h - 2) || (x === 1 && y === h - 3) || (x === 2 && y === h - 2) ||
      // Bottom-right corner
      (x === w - 2 && y === h - 2) || (x === w - 3 && y === h - 2) || (x === w - 2 && y === h - 3)
    );
  }

  generate() {
    const map = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        if (
          x === 0 || y === 0 ||
          x === this.width - 1 || y === this.height - 1
        ) {
          row.push(0); // Wall
        } else if (this.isCorner(x, y)) {
          row.push(1); // Spawn ground
        } else if (x % 2 === 0 && y % 2 === 0) {
          row.push(3); // Unbreakable
        } else {
          row.push(Math.random() < 0.7 ? 2 : 1); // 70% box, 30% ground
        }
      }
      map.push(row);
    }
    return map;
  }
}


export const PLAYER_SPAWNS = [
  { x: 1, y: 1 },                         // Top-left
  { x: 13, y: 1 },                        // Top-right
  { x: 1, y: 13 },                        // Bottom-left
  { x: 13, y: 13 },                       // Bottom-right
];