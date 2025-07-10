import { players, broadcast, getPlayersList } from "./players.js";
import { GameState, updateCountdown } from "../game/state.js";
import { PLAYER_SPAWNS } from "../game/map.js";

export class User {
  #ws = null;
  nickname = "";
  #events = {
    register: (data) => this.register(data),
    chat: (data) => {
      broadcast({
        type: "chat",
        nickname: this.nickname,
        message: data.message,
      });
    },
  };

  constructor(ws) {
    this.#ws = ws;
    ws.on("message", (raw) => {
      const data = JSON.parse(raw);
      this.#events[data.type]?.(data);
    });

    ws.on("close", () => {
      players.delete(this);
      broadcast({ type: "player_disconnected", nickname: this.nickname });
    });
  }

  on(event, handler) {
    this.#events[event] = handler;
  }

  send(msg) {
    this.#ws.send(JSON.stringify(msg));
  }

  async register(data) {
    if (!data.nickname) return;
    this.nickname = data.nickname;
    players.add(this);

    let index = 0;
    for (let player of players) {
      player.position = PLAYER_SPAWNS[index++];
    }

    updateCountdown();

    this.send({
      nickname: this.nickname,
      type: "self_register",
      players: getPlayersList(),
      map: GameState.map,
    });

    broadcast(
      { position: this.position, nickname: this.nickname, type: "new_player" },
      this
    );

    console.log("logged in as", this.nickname);
  }
}
