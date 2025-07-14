import { User } from "../network/user.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  #game = null;
  #lastInputTime = 0;
  #THROTTLE_DELAY = 300;
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
      ArrowUp: [x, y - 1],
      ArrowDown: [x, y + 1],
      ArrowRight: [x + 1, y],
      ArrowLeft: [x - 1, y],
      Space: [x, y],
    }[input];
  }
  handleInput(input) {
    const nextPosition = this.nextPosition(input);
    const canMove = this.canMoveTo(...nextPosition);
    if (nextPosition && canMove) {
      this.moveTo(...nextPosition);
    }
  }
  moveTo(x, y) {
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
    if (map[y][x] !== 1) return false;

    // throthle last moved block
    const now = performance.now();
    if (now - this.#lastInputTime < this.#THROTTLE_DELAY) return false;
    this.#lastInputTime = now;
    return true;
  }
}
