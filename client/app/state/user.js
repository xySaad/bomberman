import { router, list } from "rbind";
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
        alert: msg.alert,
      });
    },
    counter: (msg) => {
      GameState.counter.value = msg.counter;
    },
    game_started: () => {
      SelfUser.state = User.STATES.READY;
      router.navigate("/play");
    },
    game_ended: (msg) => {
      GameState.gameWinner.value = msg.winner;
      GameState.gameEnded.value = true;
    },
    player_damaged: (data) => {
      const player = GameState.players.value.find(
        (p) => p.nickname === data.nickname
      );
      if (player) {
        player.health = data.health;
        player.isDead = data.isDead;
      }
      if (data.nickname === SelfUser.nickname) {
        GameState.playerStats.value = {
          ...GameState.playerStats.value,
          health: data.health,
        };
        if (data.isDead) {
          SelfUser.state = User.STATES.ELIMINATED;
        }
      }
    },
    player_move: (data) => {
      const player = GameState.players.value.find(
        (p) => p.nickname === data.nickname
      );
      if (player) {
        player.isMoving = true;
        if (player.position.x !== data.x) {
          player.scale = player.position.x > data.x ? -1 : 1;
          player.isMoving = true;
        } else {
          player.isMoving = false;
        }
        player.position = { x: data.x, y: data.y };
      }
    },
    bomb_placed: (data) => {
      GameState.bombs.push({
        id: data.bomb.id,
        position: data.bomb.position,
        timeToExplode: data.bomb.timeToExplode,
        timeOfExplosion: data.bomb.timeOfExplosion,
      });
    },
    bomb_exploded: (data) => {
      GameState.bombs.purge((b) => b.id === data.id);
      for (const pos of data.positions) {
        const [idx] = GameState.explosions.push(pos);
        setTimeout(() => GameState.explosions.remove(idx()), 500);
        GameState.map[pos.y].value[pos.x].type = 1; // Convert box to ground
      }
    },
    power_up_spawned: (data) => {
      GameState.powerUps.push({
        id: data.powerUp.id,
        position: data.powerUp.position,
        type: data.powerUp.type,
      });
    },
    power_up_removed: (data) => {
      GameState.powerUps.purge((p) => p.id === data.powerUpId);
    },
    player_stats_updated: (data) => {
      if (data.nickname === SelfUser.nickname) {
        GameState.playerStats.value = {
          ...GameState.playerStats.value,
          [data.stat]: data.value,
        };
      }
    },
  };

  static async new(serverUrl = `ws://${location.hostname}:3000`) {
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
        GameState.map = msg.map.map((row) => list(row));
        GameState.position = msg.position;
        GameState.chatMessages.push(...msg.chatMessages);
        resolve();
      });
      this.on("register_error", (msg) => {
        reject(msg.reason);
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
