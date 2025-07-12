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
    new_player: (player) => GameState.players.push(player),
    player_deleted: (player) =>
      GameState.players.purge((p) => p.nickname === player.nickname),
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
    player_move: (data) => {
      const player = GameState.players.value.find(p => p.nickname === data.nickname);
      if (player) player.position = { x: data.x, y: data.y };
    },
    bomb_placed: (data) => {
      const { bombs } = GameState;
      const existingBomb = bombs.value.find(b => b.id === data.bombId);
      if (existingBomb) return;
      const newBomb = {
        x: data.x,
        y: data.y,
        owner: data.nickname,
        id: data.bombId,
        timestamp: Date.now()
      };
      bombs.value = [...bombs.value, newBomb];
    },
    bomb_exploded: (data) => {
      const { bombs, map } = GameState;
      const bombIndex = bombs.value.findIndex(b => b.id === data.bombId);
      if (bombIndex === -1) return;
      bombs.value = bombs.value.filter(b => b.id !== data.bombId);
      if (data.destroyedBoxes && data.destroyedBoxes.length > 0) {
        data.destroyedBoxes.forEach(box => {
          if (map[box.y] && map[box.y][box.x] === 2) {
            map[box.y][box.x] = 1;
          }
        });
        GameState.map = [...map];
      }
    }

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
    return new Promise((resolve) => {
      this.on("self_register", (msg) => {
        this.state = User.STATES.REGISTERED;
        this.nickname = msg.nickname;
        GameState.players.push(...msg.players);
        GameState.map = msg.map;
        GameState.position = msg.position;
        resolve();
      });

      this.send({ type: "register", nickname });
    });
  }

  send(msg) {
    this.#socket.send(JSON.stringify(msg));
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
