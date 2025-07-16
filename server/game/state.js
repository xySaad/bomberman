import { GameMap } from "./map.js";
import { Timer } from "../utils/timer.js";
import { Player } from "./player.js";
import { Signal } from "../utils/promise.js";

export class Game {
  static PHASES = {
    WAITING_PLAYERS: "WAITING_PLAYERS", // minimum players joined
    GETTING_READY: "GETTING_READY", // maximum players joined, or minimum players joined and waiting timer finished
    STARTED: "STARTED", // ready timer has finished
    ENDED: "ENDED", // only one player left or the time limit has ended
  };

  #timeLimit = 3 * 60 * 1000; // 3 minutes time limit for each game
  #minPlayers = 2;
  #bombCounter = 0;
  #powerUpCounter = 0;
  bombs = [];
  powerUps = [];
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
    this.pool = gamePool;
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


  addBomb(x, y, radius) {
    const sig = new Signal()
    if (this.tileHasBomb(x, y)) return [false];
    const timeToExplode = 3000;

    const bomb = {
      id: this.getNextBombId(),
      position: { x, y },
      radius,
    };

    this.broadcast({ type: "bomb_placed", bomb, });
    setTimeout(() => {
      // player.explodeBomb
      this.explodeBomb(bomb.id);
      sig.resolve()
    }, timeToExplode);

    this.bombs.push(bomb);
    this.map[y][x].hasBomb = true;
    return [true, sig.promise];
  }
  explodeBomb(bombId) {
    const bomb = this.getBomb(bombId);
    if (!bomb) return;
    const { x, y } = bomb.position;
    const radius = bomb.radius;
    const map = this.map;
    const explodedTiles = [{ x, y }];
    const directions = [
      [0, -1], // up
      [0, 1],  // down
      [-1, 0], // left
      [1, 0],  // right
    ];

    for (const [dx, dy] of directions) {
      for (let r = 1; r <= radius; r++) {
        const nx = x + dx * r;
        const ny = y + dy * r;

        if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) break;

        const tileType = this.getTileType(nx, ny);
        if (tileType === 0 || tileType === 3) {
          break;
        }

        explodedTiles.push({ x: nx, y: ny });

        if (tileType === 2) {
          //  tile kichnaga ms flfront not yet 
          this.setTileType(nx, ny, 1);
          if (Math.random() < 0.7) { // 100% chance for now hh
            this.spawnPowerUp(nx, ny, 'bombpowerup');
          }
          break;
        }
      }
    }
    this.removeBomb(bombId);
    this.broadcast({
      type: "bomb_exploded",
      id: bombId,
      positions: explodedTiles
    });
  }
  removeBomb(bombId) {
    const index = this.bombs.findIndex(bomb => bomb.id === bombId);
    if (index === -1) return

    const bomb = this.bombs[index];
    const { x, y } = bomb.position;
    this.map[y][x].hasBomb = false;
    this.bombs.splice(index, 1);
  }


  getNextBombId() {
    return ++this.#bombCounter;
  }
  getNextPowerUpId() {
    return ++this.#powerUpCounter;
  }

  getAllBombs() {
    return this.bombs;
  }

  getBomb(bombId) {
    return this.bombs.find(bomb => bomb.id === bombId);
  }

  tileHasBomb(x, y) {
    return this.map[y] && this.map[y][x] && this.map[y][x].hasBomb;
  }
  getTileType(x, y) {
    return this.map[y] && this.map[y][x] ? this.map[y][x].type : null;
  }

  setTileType(x, y, type) {
    if (this.map[y] && this.map[y][x]) {
      this.map[y][x].type = type;
    }
  }

  spawnPowerUp(x, y, type = 'bomb') {
    const powerUp = {
      id: this.getNextPowerUpId(),
      position: { x, y },
      type,
      spawned: Date.now()
    };

    this.powerUps.push(powerUp);
    this.broadcast({
      type: "power_up_spawned",
      powerUp
    });

    return powerUp;
  }
  removePowerUp(powerUpId) {
    const index = this.powerUps.findIndex(powerUp => powerUp.id === powerUpId);
    if (index !== -1) {
      this.powerUps.splice(index, 1);
      this.broadcast({
        type: "power_up_removed",
        powerUpId: powerUpId
      });
    }
  }
  getPowerUpAt(x, y) {
    return this.powerUps.find(powerUp =>
      powerUp.position.x === x && powerUp.position.y === y
    );
  }

  collectPowerUp(player, powerUpId) {
    const powerUp = this.powerUps.find(p => p.id === powerUpId);
    if (!powerUp) return false;


    switch (powerUp.type) {
      case 'bombpowerup':
        player.maxBombs++;
        break;
      // power ups lokhrin 
    }

    this.removePowerUp(powerUpId);
    //this for updating the ui ms mabghach tkhdmli hhh 
    // this.broadcast({
    //   type: "power_up_collected",
    //   nickname: player.nickname,
    //   powerUpType: powerUp.type,
    //   newMaxBombs: player.maxBombs
    // });

    return true;
  }
}
