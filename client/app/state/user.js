
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
  #bombTimeouts = new Map();
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
    player_move: (data) => {
      console.log(data);
      const palyer = GameState.players.value.find(p => p.nickname === data.nickname);
      if (palyer) palyer.position = { x: data.x, y: data.y };
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
        setTimeout(() => GameState.explosions.remove(idx()), 500)
        GameState.map[pos.y].value[pos.x].type = 1; // Convert box to ground
      }
    },
    power_up_spawned: (data) => {
      console.log(data.powerUp);
      GameState.powerUps.push({
        id: data.powerUp.id,
        position: data.powerUp.position,
        type: data.powerUp.type,
        spawned: data.powerUp.spawned
      });
    },
    power_up_removed: (data) => {
      console.log("remove ", data.powerUpId);
      GameState.powerUps.purge((p) => p.id === data.powerUpId);
    },
    // mabghatch tupdati lui 
    // power_up_collected: (data) => {
    //   if (data.nickname === SelfUser.nickname) {
    //     const currentStats = GameState.playerStats.value;

    //     switch (data.powerUpType) {
    //       case 'bombpowerup':
    //         GameState.playerStats.value = {
    //           ...currentStats,
    //           maxBombs: data.newMaxBombs || currentStats.maxBombs + 1
    //         };
    //         break;

    //       // case 'speedpowerup':
    //       //   GameState.playerStats.value = {
    //       //     ...currentStats,
    //       //     speed: currentStats.speed + 1
    //       //   };
    //       //   break;
    //       // case 'radiuspowerup':
    //       //   GameState.playerStats.value = {
    //       //     ...currentStats,
    //       //     bombRadius: currentStats.bombRadius + 1
    //       //   };
    //       //   break;
    //     }
    //   }

    // },
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
        // GameState.map = msg.map;
        msg.map.forEach(row => {
          GameState.map.push(list([]))
          GameState.map[GameState.map.length - 1].push(...row)
        });
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
