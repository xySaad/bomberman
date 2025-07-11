import { list, state } from "rbind";
export const GameState = {
  players: list([]),
  chatMessages: list([]),
  map: null,
  counter: state(null),
  position: null,
  bombs: list([]), // List to hold bomb positions
};
