export function canMoveTo(map, x, y) {
  if (!map[y] || map[y][x] === undefined) return false;
  return map[y][x] === 1; 
}



export function hasBombAt(bombs, x, y) {
  return bombs.find(bomb => bomb.x === x && bomb.y === y) !== undefined;
}
