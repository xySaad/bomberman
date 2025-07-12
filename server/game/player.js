import { User } from "../network/user.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  get nickname() {
    return this.#nickname;
  }
  position = { x: 0, y: 0 };
   hasBomb = false;
  #game = null;
  constructor(ws, nickname, game) {
    super(ws);
    this.#game = game;
    this.#nickname = nickname;
    this.position = PLAYER_SPAWNS[game.players.size];

    this.send({
      nickname: nickname,
      type: "self_register",
      players: game.getPlayersList(),
      map: game.map,
      position: this.position,
    });

  }

  static fromUser = class PlayerFromUser extends this {
    constructor(user, nickname, game) {
      super(user.ws, nickname, game);
    }
  };
}
