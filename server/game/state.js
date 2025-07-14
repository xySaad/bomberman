import { GameMap } from "./map.js";
import { Timer } from "../utils/timer.js";
import { Player } from "./player.js";

export class Game {
  static PHASES = {
    WAITING_PLAYERS: "WAITING_PLAYERS", // minimum players joined
    GETTING_READY: "GETTING_READY", // maximum players joined, or minimum players joined and waiting timer finished
    STARTED: "STARTED", // ready timer has finished
    ENDED: "ENDED", // only one player left or the time limit has ended
  };

  #timeLimit = 3 * 60 * 1000; // 3 minutes time limit for each game
  #minPlayers = 2;
  get minPlayers() {
    return this.#minPlayers;
  }
  #maxPlayers = 4;
  get maxPlayers() {
    return this.#maxPlayers;
  }
  lobbyCounter = new Timer((counter) =>
    this.broadcast({ type: "counter", counter })
  );
  map = new GameMap().generate();
  #players = new Set();
  get players() {
    return this.#players;
  }
  #_phase = Game.PHASES.WAITING_PLAYERS;
  set #phase(ph) {
    this.#_phase = ph;
    this.broadcast({ type: "game_phase", phase: ph });
  }
  get #phase() {
    return this.#_phase;
  }
  get phase() {
    return this.#_phase;
  }
  #gamePool = null;
  constructor(gamePool) {
    this.#gamePool = gamePool;
  }

  async updateCountdown() {
    if (this.#players.size === this.#minPlayers) {
      try {
        this.#phase = Game.PHASES.WAITING_PLAYERS;
        await this.lobbyCounter.start(20);
        this.#phase = Game.PHASES.GETTING_READY;
        await this.lobbyCounter.start(10);

        this.#phase = Game.PHASES.STARTED;
        this.broadcast({ type: "game_started" });
      } catch (error) {
        console.error(error);
      }
    } else if (this.#players.size === this.#maxPlayers) {
      this.lobbyCounter.stop();
    }
  }

  getPlayersList() {
    return Array.from(this.#players.values()).map((player) => ({
      nickname: player.nickname,
      position: player.position,
    }));
  }

  hasNickname(nickname) {
    return [...this.#players].some(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
    );
  }
  createPlayer(user, nickname) {
    if (this.hasNickname(nickname)) {
      user.send({
        type: "register_error",
        reason: "Nickname already taken",
      });
      return null;
    }
    const player = new Player(user.ws, nickname, this);
    this.players.add(player);
    this.broadcast({
      position: player.position,
      nickname: player.nickname,
      type: "new_player",
    });
    this.broadcast({
      type: "chat",
      nickname: player.nickname,
      alert: `joined the game`,
    });
    this.updateCountdown();
    return player;
  }

  deletePlayer(player) {
    this.players.delete(player);
    this.broadcast({ type: "player_deleted", nickname: player.nickname });
    this.broadcast({
      type: "chat",
      nickname: player.nickname,
      alert: `left the game`,
    });
    if (this.phase === Game.PHASES.WAITING_PLAYERS) {
      if (this.players.size === 0) {
        this.#gamePool.deleteGame(this);
      } else if (this.players.size < this.minPlayers) {
        this.lobbyCounter.cancel();
        this.broadcast({ type: "counter", counter: null });
      }
    }
  }
  broadcast(msg) {
    this.#players.forEach((player) => {
      player.send(msg);
    });
  }
}
