import html from "rbind";
import { GameState } from "../state/game";
import { SelfUser, User } from "../state/user";
import { App } from "../App";
import { getClass, HandleInput } from "../../utils/handlers";
const { div } = html;


window.addEventListener("keyup", HandleInput);


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
