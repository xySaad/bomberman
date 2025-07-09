import html from "rbind";
import { GameState } from "../state/game";
import { SelfUser, User } from "../state/user";
import { App } from "../App";

const getClass = {
  0: "wall",
  1: "ground",
  2: "box",
  3: "unbreakable",
};

export const PlayGround = () => {
  if (SelfUser.state !== User.STATES.READY) return App();

  const map = GameState.map;
  if (!map) return html.div({ textContent: "Waiting for map..." });

  return html.div({ class: "playground-grid" }).add(
    ...map.flatMap((row) =>
      row.map((type) =>
        html.div({
          class: getClass[type] || "unknown",
        })
      )
    )
  );
};
