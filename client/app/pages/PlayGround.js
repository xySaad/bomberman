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
          style: ($) =>
            `transform: translate(${$(pos).x * OFFSET}px, ${
              $(pos).y * OFFSET
            }px);`,
        });
      })
    )
  );
};
