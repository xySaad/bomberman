import { User } from "../network/user.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  get nickname() {
    return this.#nickname;
  }
  position = { x: 0, y: 0 };
  #game = null;
  constructor(ws, nickname, game) {
    super(ws);
    this.#game = game;
    this.#nickname = nickname;
    this.send({
      nickname: nickname,
      type: "self_register",
      players: game.getPlayersList(),
      map: game.map,
    });
    this.on("player_move", (data) => {
    this.position = data.position;

    this.#game.broadcast({
      type: "player_move",
      nickname: this.nickname,
      position: this.position,
    });
  });
    this.position = PLAYER_SPAWNS[game.players.size];
  }

  static fromUser = class PlayerFromUser extends this {
    constructor(user, nickname, game) {
      super(user.ws, nickname, game);
    }
  };
}
