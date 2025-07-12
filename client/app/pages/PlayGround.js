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
  
  const player = players.value.find((p) => p.nickname === SelfUser.nickname); // Use nickname instead of id
  if (!player) {
    console.warn("Current player not found in GameState");
    return;
  }

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
      const playerHasBomb = bombs.value.find(b => b.owner === SelfUser.nickname);
      if (playerHasBomb) {
        console.log("You already have a bomb placd!");
        return;
      }

      const existingBomb = bombs.value.find(b => b.x === x && b.y === y);
      if (existingBomb) {
        console.log("Bomb alrady exist at this position");
        return;
      }
      SelfUser.send({
        type: "place_bomb",
        x: x,
        y: y
      });
      
      return;

    default:
      return;
  }

  if (canMoveTo(nextX, nextY)) {
    player.$.position.value = { x: nextX, y: nextY };
 SelfUser.send({
  type: "player_move",
  x: nextX,
  y: nextY,
});
   console.log(`${SelfUser.nickname} moved to:`, nextX, nextY);
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
              'data-owner': bomb.owner,
              title: `${bomb.owner}'s bomb`,
              style: `transform: translate(${bomb.x * OFFSET}px, ${bomb.y * OFFSET}px);`
            })
          )
        ),
      players.map((player) => {
        const pos = player.$.position;
        const isCurrentPlayer = player.nickname === SelfUser.nickname;
        return div({
          class: `player ${isCurrentPlayer ? 'current-player' : 'other-player'}`,
          'data-nickname': player.nickname,
          title: player.nickname,
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
