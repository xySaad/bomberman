import { broadcast, players, getPlayersList } from "./playersStore.js";
import { GameState, updateCountdown } from "./index.js";
import { PLAYER_SPAWNS } from "./map/generateMap.js";

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
    const nickname = (this.nickname = data.nickname);
    // TODO: validate nickname
    players.add(this);


   let index = 0;
  for (let player of players) {
    player.position = PLAYER_SPAWNS[index++];
  }
  console.log(index);
  console.log(players);
  
  

    updateCountdown();

    this.send({
      nickname,
      type: "self_register",
      players: getPlayersList(),
      map: GameState.map,
    });

    broadcast({ position: this.position, nickname, type: "new_player" }, this);
    console.log("logged in as", this.nickname);
  }
}
