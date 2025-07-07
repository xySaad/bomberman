import { Game } from "./game";

export class GameSocket {
  #socket = null;
  constructor(serverUrl, { resolve, reject }) {
    const ws = (this.#socket = new WebSocket(serverUrl));
    ws.onopen = resolve;
    ws.onclose = reject;
    ws.onerror = reject;
    ws.onmessage = this.handleMessage;
  }

  handleMessage(ev) {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "registered") {
        Game.players.push(msg.nickname);
      } else if (msg.type === "players_list") {
        Game.players.push(...msg.players);
      }
    } catch (err) {
      console.log(err);
      console.error("Invalid message:", ev.data);
    }
  }

  sendMessage(msg) {
    this.#socket.send(JSON.stringify(msg));
  }
}
