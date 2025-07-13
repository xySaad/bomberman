import { User } from "../network/user.js";
import { PLAYER_SPAWNS } from "./map.js";

export class Player extends User {
  #nickname = null;
  get nickname() {
    return this.#nickname;
  }
  position = { x: 0, y: 0 };
  constructor(ws, nickname, game) {
    super(ws);
    this.#nickname = nickname;
    this.send({
      nickname: nickname,
      type: "self_register",
      players: game.getPlayersList(),
      map: game.map,
    });
    this.position = PLAYER_SPAWNS[game.players.size];
    this.game = game
  }
  moveTo(newx, newy) {
    this.position = { x: newx, y: newy };
    this.game.broadcast({
      type: "player_move",
      nickname: this.#nickname,
      x: newx,
      y: newy
    });
  }
}
