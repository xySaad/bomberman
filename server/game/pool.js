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

      if (players.size < maxPlayers && phase === Game.PHASES.WAITING_PLAYERS) {
        return game;
      }
    }

    const newGame = new Game(this);
    this.#games.push(newGame);
    return newGame;
  }
  handleInput(player, input) {
    if (!this.canPlayerSendInput(player)) return;
    const { x, y } = player.position;
  
    
    switch (input) {
      case "up":
        
        if(this.canMoveTo(player,x,y-1))player.moveTo(x, y - 1)

        break;
      case "down":
      if(this.canMoveTo(player,x,y+1))player.moveTo(x, y + 1);

        break;
      case "left":
        if(this.canMoveTo(player,x-1,y)) player.moveTo(x - 1, y);

        break;
      case "right":
         if(this.canMoveTo(player,x+1,y)) player.moveTo(x + 1, y);
        break;
      case "Space":

        break;
      default:
        return;
    }
  }
 canMoveTo(player, x, y) {
  const game = player.game.map;
  if (y < 0 || y >= game.length || x < 0 || x >= game[0].length) {
    return false;
  }
  return game[y][x] === 1;
}
canPlayerSendInput(player) {
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
