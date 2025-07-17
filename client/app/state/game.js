import { list, state } from "rbind";
export const GameState = {
  players: list([]),
  chatMessages: list([]),
  map: [],
  counter: state(null),
  position: null,
  bombs: list([]),
  explosions: list([]),
  powerUps: list([]),
  playerStats: state({
    maxBombs: 1,
    health: 3,
    speed: 1,
    bombRadius: 1
  })
};
