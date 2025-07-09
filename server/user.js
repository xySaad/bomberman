import { broadcast, clients, getPlayersList } from "./clientsStore.js";

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
      clients.delete(this);
      broadcast({ type: "player_disconnected", nickname: this.nickname });
    });
  }

  on(event, handler) {
    this.#events[event] = handler;
  }
  send(msg) {
    this.#ws.send(JSON.stringify(msg));
  }
  register(data) {
    if (!data.nickname) return;
    const nickname = (this.nickname = data.nickname);
    // TODO: validate nickname
    clients.add(this);

    this.send({ nickname, type: "self_register", players: getPlayersList() });
    broadcast({ nickname, type: "new_player" }, this);
    console.log("logged in as", this.nickname);
  }
}
