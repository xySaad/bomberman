import { User } from "../network/user.js";
import { throttle } from "../utils/throttle.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  #game = null;
  #stepUnite = 0.3;
  speed = 1;
  #throttledMoveTo = throttle(100, (...args) => this.moveTo(...args));
  maxBombs = 1;
  health = 3;
  bombRadius = 1;
  bombs = 0;
  #intervalId = null;
  #activeKeys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
  };
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
    this.#intervalId = setInterval(() => {
      for (const key in this.#activeKeys) {
        if (!this.#activeKeys[key]) continue;
        const nextPosition = this.nextPosition(key);
        if (!nextPosition) return;
        const canMove = this.canMoveTo(...nextPosition);
        if (canMove) {
          this.#throttledMoveTo(...nextPosition);
        } else {
          this.moveToSafestblock(...nextPosition);
        }
      }
    }, 100);
  }

  destroy() {
    super.destroy()
    this.#game.deletePlayer(this)
    this.#game.checkGameEnd();
    clearInterval(this.#intervalId);
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
    const step = this.speed * this.#stepUnite;
    return {
      ArrowUp: [x, y - step],
      ArrowDown: [x, y + step],
      ArrowRight: [x + step, y],
      ArrowLeft: [x - step, y],
    }[input];
  }
  handleInput(input, active) {
    if (input === "Space") {
      this.placeBomb();
      return;
    }
    console.log(input);
    
    this.#activeKeys[input] = active;
  }
  moveTo(x, y) {
    const powerUp = this.#game.getPowerUpAt(Math.round(x), Math.round(y));
    if (powerUp) {
      this.#game.collectPowerUp(this, powerUp.id);
    }
    this.#game.broadcast({
      type: "player_move",
      nickname: this.#nickname,
      ...(this.position = { x, y }),
    });
  }
  moveToSafestblock(nextX, nextY) {
    const { x, y } = this.position;
    const safeX = x !== nextX ? Math.round(x) : x;
    const safeY = y !== nextY ? Math.round(y) : y;
    if (this.canMoveTo(safeX, safeY)) {
      this.#throttledMoveTo(safeX, safeY);
    }
  }
  getClosetBlock(dimension, pos) {
    const currentPos = this.position[dimension];
    if (currentPos === pos)
      return [Math.round(pos - 0.2), Math.round(pos + 0.2)];
    const block = currentPos > pos ? Math.floor(pos) : Math.ceil(pos);
    return [block];
  }
  canMoveTo(nextX, nextY) {
    const xs = this.getClosetBlock("x", nextX);
    const ys = this.getClosetBlock("y", nextY);

    // check if he can move to that block
    const { map } = this.#game;
    for (const x of xs) {
      for (const y of ys) {
        console.log(x, y);

        if (y < 0 || y >= map.length || x < 0 || x >= map[0].length)
          return false;

        if (this.#game.getTileType(x, y) !== 1) return false;
        if (this.#game.tileHasBomb(x, y)) return false;
      }
    }
    return true;
  }
  async placeBomb() {
    if (this.bombs >= this.maxBombs) return false;
    const { x, y } = this.position;
    const [added, untilExplode] = this.#game.addBomb(
      this.getClosetBlock("x", x)[0],
      this.getClosetBlock("y", y)[0],
      this.bombRadius
    );
    if (added) {
      this.bombs++;
      await untilExplode;
      this.bombs--;
    }
  }
}
