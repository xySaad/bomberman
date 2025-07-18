import { User } from "../network/user.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  #game = null;
  #lastInputTime = 0;
  #THROTTLE_DELAY = 300;
  maxBombs = 1;
  health = 3
  speed = 1;
  bombRadius = 1;
  bombs = 0
  isDead = false;
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
  destroy() {
    super.destroy()
    this.#game.deletePlayer(this)
    this.#game.checkGameEnd();
  }
  takeDamage() {
    this.health -= 1;
    if (this.health < 1) {
      this.health = 0;
      this.on("player_input", null)
      this.isDead = true;
      this.#game.broadcast({ type: "player_deleted", nickname: this.nickname });
      this.#game.checkGameEnd();
    }
  }
  nextPosition(input) {
    const { x, y } = this.position;
    return {
      ArrowUp: [x, y - 1],
      ArrowDown: [x, y + 1],
      ArrowRight: [x + 1, y],
      ArrowLeft: [x - 1, y],

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
      this.moveTo(...nextPosition);
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
  canMoveTo(x, y) {
    // check if he can move to that block
    const { map } = this.#game;
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
    if (this.#game.getTileType(x, y) !== 1) return false;
    if (this.#game.tileHasBomb(x, y)) return false;
    // throthle last moved block
    const now = performance.now();
    if (now - this.#lastInputTime < this.#THROTTLE_DELAY) return false;
    this.#lastInputTime = now;
    return true;
  }
  async placeBomb() {
    if (this.bombs >= this.maxBombs) return false;
    const { x, y } = this.position;
    const [added, untilExplode] = this.#game.addBomb(x, y, this.bombRadius);
    if (added) {
      this.bombs++
      await untilExplode
      this.bombs--
    }
  }

}
