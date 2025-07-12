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
      console.log("moveee", data);
      const player = GameState.players.value.find(p => p.nickname === data.nickname);
      if (player) {
        if (player.nickname !== SelfUser.nickname) {
          console.log(`Updat  ${player.nickname} to`, data.x, data.y);
          player.$.position.value = { x: data.x, y: data.y };
        } else {
          console.log(`Ignoring position update for current user: ${player.nickname}`);
        }
      } else {
        console.warn("Player not found:", data.nickname);
      }
    },

    bomb_placed: (data) => {
      console.log("Bomb placed by:", data.nickname, "at", data.x, data.y);
      const { bombs } = GameState;
      const existingBomb = bombs.value.find(b => b.id === data.bombId);
      if (existingBomb) {
        console.log("Bomb already exists, skipping:", data.bombId);
        return;
      }

      const newBomb = {
        x: data.x,
        y: data.y,
        owner: data.nickname,
        id: data.bombId,
        timestamp: Date.now()
      };

      bombs.value = [...bombs.value, newBomb];
      console.log("Bomb added to GameState:", newBomb);
    },
    bomb_exploded: (data) => {
      console.log("Bomb exploded:", data.bombId);
      const { bombs } = GameState;
     const bombIndex = bombs.value.findIndex(b => b.id === data.bombId);
    if (bombIndex === -1) {
      console.warn("Bomb not found for explosion:", data.bombId);
      return;
    }
     bombs.value = bombs.value.filter(b => b.id !== data.bombId);
    
    if (data.playerDisconnected) {
      console.log("Bomb removed due to player disconnection");
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
