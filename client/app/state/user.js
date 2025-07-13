import { router } from "rbind";
import { GameState } from "./game";

export class User {
  static STATES = Object.freeze({
    INIT: 0,
    CONNECTED: 1,
    REGISTERED: 2,
    READY: 3,
    ELIMINATED: 4,
    DISCONNECTED: 5,
  });

  state = User.STATES.INIT;
  nickname = "";
  #socket = null;
  #events = {
    new_player: (player) => {
      GameState.players.push(player);
      GameState.chatMessages.push({
        alert: `${player.nickname} has joined the game`,
      });
    },
    player_deleted: (player) => {
      GameState.players.purge((p) => p.nickname === player.nickname);
      GameState.chatMessages.push({
        alert: `${player.nickname} has left the game`,
      });
    },
    chat: (msg) => {
      GameState.chatMessages.push({
        nickname: msg.nickname,
        message: msg.message,
      });
    },
    counter: (msg) => {
      GameState.counter.value = msg.counter;
    },
    game_started: () => {
      SelfUser.state = User.STATES.READY;
      router.navigate("/play");
    },
  };

  static async new(serverUrl = "ws://localhost:3000") {
    const user = new this();
    await user.#connectSocket(serverUrl);
    user.state = this.STATES.CONNECTED;
    return user;
  }

  async #connectSocket(serverUrl) {
    return new Promise((resolve, reject) => {
      const ws = (this.#socket = new WebSocket(serverUrl));

      ws.onopen = () => resolve();
      ws.onclose = reject;
      ws.onerror = reject;
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          this.#events[msg.type]?.(msg);
        } catch (err) {
          console.error(err);
          console.error("Invalid message:", ev.data);
        }
      };
    });
  }

  async connect(nickname) {
    return new Promise((resolve, reject) => {
      this.on("self_register", (msg) => {
        this.state = User.STATES.REGISTERED;
        this.nickname = msg.nickname;
        GameState.players.push(...msg.players);
        GameState.map = msg.map;
        GameState.position = msg.position;
        resolve();
      });
      this.on("register_error", (msg) => {
        reject(msg.reason);
      });
      this.send({ type: "register", nickname });
    });
  }

  send(msg) {
    if (SelfUser.state !== User.STATES.READY) {
      this.#socket.send(JSON.stringify(msg));
    }
  }

  on(event, handler) {
    this.#events[event] = handler;
  }

  sendChat(message) {
    this.send({
      type: "chat",
      message,
    });
  }
}

export const SelfUser = await User.new();
