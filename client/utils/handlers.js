import { SelfUser } from "../app/state/user";

export function HandleInput(e) {
  let inputType = null;
  switch (e.key) {
    case "ArrowUp":
      inputType = "ArrowUp";
      break;
    case "ArrowDown":
      inputType = "ArrowDown";
      break;
    case "ArrowLeft":
      inputType = "ArrowLeft";
      break;
    case "ArrowRight":
      inputType = "ArrowRight";
      break;
    case " ":
      inputType = "Space";
      break;
    default:
      return;
  }
  SelfUser.send({
    type: "player_input",
    input: inputType
  });
}

export const getClass = {
  0: "wall",
  1: "ground",
  2: "box",
  3: "unbreakable",
};
