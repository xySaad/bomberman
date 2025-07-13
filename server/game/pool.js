import { Game } from "./state.js";

export class GamePool {
  #games = [new Game(this)];
  #playerThrottles = new Map();
  deleteGame(game) {
    this.#games.splice(this.#games.indexOf(game), 1);
  }
  lookup() {
    for (const game of this.#games) {
      const { players, maxPlayers, phase } = game;
      if (players.size < maxPlayers && phase === Game.PHASES.WAITING_PLAYERS) return game;
    }
    const newGame = new Game(this);
    this.#games.push(newGame);
    return newGame;
  }
  handleInput(player, input) {
    if (!this.canSend(player)) return;
    const { x, y } = player.position;
    const nextPosition = {
      ArrowUp: [x, y - 1],
      ArrowDown: [x, y + 1],
      ArrowRight: [x + 1, y],
      ArrowLeft: [x - 1, y],
      Space: [x, y],
    }[input];

    const canMove = player.canMoveTo(player, ...nextPosition);
    if (nextPosition && canMove) {
      player.moveTo(...nextPosition);
    }
  }
  
  canSend(player) {
    const playerr = player.nickname;
    const now = Date.now();
    const throttleData = this.#playerThrottles.get(playerr);
    const THROTTLE_DELAY = 100;
    if (!throttleData || now - throttleData.lastInput >= THROTTLE_DELAY) {
      this.#playerThrottles.set(playerr, { lastInput: now });
      return true;
    }
    return false;
  }
}
