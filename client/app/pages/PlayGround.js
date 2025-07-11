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

function canMoveTo(x, y) {
  const { map } = GameState;
  if (!map[y] || map[y][x] === undefined) return false;
  return map[y][x] === 1;
}

function HandleMove(e) {
  const { players } = GameState;
  const player = players.value.find((p) => p.id === SelfUser.id);
  if (!player) return;

  const { position } = player.$;
  let { x, y } = position.value;

  let nextX = x;
  let nextY = y;

  switch (e.key) {

    case "ArrowUp":
      nextY -= 1;
      break;
    case "ArrowDown":
      nextY += 1;
      break;
    case "ArrowLeft":
      nextX -= 1;
      break;
    case "ArrowRight":
      nextX += 1;
      break;
    case " ":
      console.log("Booommmmm ");
      const { bombs } = GameState;
      const existing = bombs.value.find(b => b.x === x && b.y === y);
      if (!existing) {
        bombs.value = [...bombs.value, { x, y }];
        console.log("Bomb placed at:", x, y);
      } else {
        console.log("Bomb already exists here");
      }
      return;

    default:
      return;
  }

  if (canMoveTo(nextX, nextY)) {
    player.$.position.value = { x: nextX, y: nextY };
    console.log(nextX, nextY);
  } else {
    console.log("Blocked move to:", nextX, nextY);
  }
}
window.addEventListener("keyup", HandleMove);


export const PlayGround = () => {
  if (SelfUser.state !== User.STATES.READY) return App();

  const { players, map, bombs } = GameState;
  const TILE_SIZE = 42;
  const GAP = 2;
  const OFFSET = TILE_SIZE + GAP;
  console.log("Bombs:", bombs.value);
  return div({ class: "playground" }).add(
    div({ class: "grid-wrapper" }).add(
      div({ class: "playground-grid" }).add(
        ...map.flat().map((type) => div({ class: getClass[type] || "unknown" }))
      ),
      (w, c) => c(() => w(bombs).length) && 
        div({ class: "bombs-container" }).add(
          ...w(bombs).map((bomb) => 
            div({
              class: "bomb",
              style: `transform: translate(${bomb.x * OFFSET}px, ${bomb.y * OFFSET}px);`
            })
          )
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
