export class GameMap {
  constructor(width = 15, height = 15) {
    this.width = width;
    this.height = height;
  }

  isCorner(x, y) {
    const w = this.width;
    const h = this.height;
    return (
      (x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1) ||
      (x === w - 2 && y === 1) || (x === w - 3 && y === 1) || (x === w - 2 && y === 2) ||
      (x === 1 && y === h - 2) || (x === 1 && y === h - 3) || (x === 2 && y === h - 2) ||
      (x === w - 2 && y === h - 2) || (x === w - 3 && y === h - 2) || (x === w - 2 && y === h - 3)
    );
  }

  generate() {
    const map = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        let tileType;
        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          tileType = 0; // Wall
        } else if (this.isCorner(x, y)) {
          tileType = 1; // Spawn ground
        } else if (x % 2 === 0 && y % 2 === 0) {
          tileType = 3; // Unbreakable
        } else {
          tileType = Math.random() < 0.7 ? 2 : 1; // 70% box, 30% ground
        }
        row.push({
          type: tileType,
          hasBomb: false
        });
      }
      map.push(row);
    }
    return map;
  }
}

export const PLAYER_SPAWNS = [
  { x: 1, y: 1 },
  { x: 13, y: 1 },
  { x: 1, y: 13 },
  { x: 13, y: 13 },
];