import { User } from "../network/user.js";
import { throttle } from "../utils/throttle.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  #game = null;
  #speed = 0.2; // 0.2 per 100ms
  #throttledMoveTo = throttle(100, (...args) => this.moveTo(...args));
  maxBombs = 1;
  health = 3;
  speed = 1;
  bombRadius = 1;
  bombs = 0;
  get nickname() {
    return this.#nickname;
  }
  position = { x: 0, y: 0 };
  constructor(ws, nickname, game) {
    super(ws);
    this.send({
      nickname: nickname,
      type: "self_register",
      players: game.getPlayersList(),
      map: game.map,
    });
    this.#nickname = nickname;
    this.position = PLAYER_SPAWNS[game.players.size];
    this.#game = game;
  }

  nextPosition(input) {
    const { x, y } = this.position;
    return {
      ArrowUp: [x, y - 1 * this.#speed],
      ArrowDown: [x, y + 1 * this.#speed],
      ArrowRight: [x + 1 * this.#speed, y],
      ArrowLeft: [x - 1 * this.#speed, y],
    }[input];
  }
  handleInput(input) {
    if (input === "Space") {
      this.placeBomb();
      return;
    }
    const nextPosition = this.nextPosition(input);
    if (!nextPosition) return;
    const canMove = this.canMoveTo(...nextPosition);
    if (canMove) {
      this.#throttledMoveTo(...nextPosition);
    }
  }
  moveTo(x, y) {
    const powerUp = this.#game.getPowerUpAt(x, y);
    if (powerUp) {
      this.#game.collectPowerUp(this, powerUp.id);
    }
    this.#game.broadcast({
      type: "player_move",
      nickname: this.#nickname,
      ...(this.position = { x, y }),
    });
  }
  canMoveTo(nextX, nextY) {
    const { x: currentX, y: currentY } = this.position;
    const x = currentX > nextX ? Math.floor(nextX) : Math.ceil(nextX);
    const y = currentY > nextY ? Math.floor(nextY) : Math.ceil(nextY);

    // check if he can move to that block
    const { map } = this.#game;
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;

    if (this.#game.getTileType(x, y) !== 1) return false;
    if (this.#game.tileHasBomb(x, y)) return false;
    return true;
  }
  async placeBomb() {
    if (this.bombs >= this.maxBombs) return false;
    const { x, y } = this.position;
    const [added, untilExplode] = this.#game.addBomb(x, y, this.bombRadius);
    if (added) {
      this.bombs++;
      await untilExplode;
      this.bombs--;
    }
  }
}
