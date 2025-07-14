import { Game } from "./state.js";

export class GamePool {
  #games = [new Game(this)];
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
}
