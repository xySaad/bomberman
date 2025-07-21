import { list, state } from "rbind";
export class Game {
  constructor() {
    this.reset();
  }
  reset() {
    this.players = list([]);
    this.chatMessages = list([]);
    this.map = [];
    this.counter = state(null);
    this.position = null;
    this.bombs = list([]);
    this.explosions = list([]);
    this.powerUps = list([]);
    this.gameEnded = state(false);
    this.gameWinner = state(null);
    this.playerStats = state({
      maxBombs: 1,
      health: 3,
      speed: 1,
      bombRadius: 1,
    });
  }
}

export const GameState = new Game();
