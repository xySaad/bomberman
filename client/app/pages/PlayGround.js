import html from "rbind";
import { GameState } from "../state/game";
import { SelfUser, User } from "../state/user";
import { App } from "../App";
const { div } = html;
const getClass = {
  0: "wall",
  1: "ground",
  2: "box",
  3: "unbreakable",
};
 function HandleMove(e) {
  const { players } = GameState;
  const player = players.value.find((p) => p.id === SelfUser.id);
  if (!player) return;

  const { position } = player.$;
  console.log(e.key);   
  
  let { x, y } = position.value;

  switch (e.key) {
    case "ArrowUp":
      y -= 1;
    console.log("UP");

      break;
    case "ArrowDown":
      y += 1;
    console.log("Down");

      break;
    case "ArrowLeft":
      x -= 1;
    console.log("Left");

      break;
    case "ArrowRight":
      x += 1;
    console.log("right");

      break;
    case " ":
    case "Spacebar":
      console.log("Spacebar action!");
      return;
    default:
      return;
  }
  player.$.position.value = { x, y };
  console.log("Moved to:", x, y);
  console.log(position);
  
}

    window.addEventListener("keyup", HandleMove);
  export const PlayGround = () => {
    if (SelfUser.state !== User.STATES.READY) return App();

    const { players, map } = GameState;
    const TILE_SIZE = 42;
    const GAP = 2;
    const OFFSET = TILE_SIZE + GAP;

    return div({ class: "playground" }).add(
      div({ class: "grid-wrapper" }).add(
        div({ class: "playground-grid" }).add(
          ...map.flat().map((type) => div({ class: getClass[type] || "unknown" }))
        ),
        players.map((player) => {
          const pos = player.$.position;
          return div({
            class: "player",
            style: ($) => {
              const { x, y } = $(pos); 
              console.log("Render triggered", x, y);
              return `transform: translate(${x * OFFSET}px, ${y * OFFSET}px);`;
            }

          });
        })
      )
    );
  };
