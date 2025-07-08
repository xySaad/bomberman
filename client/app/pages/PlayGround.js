import html from "rbind";
import { Game } from "../state/game";

const getClass = {
  0: "wall",
  1: "ground",
  2: "box",
  3: "unbreakable",
};

export const PlayGround = () => {
  const map = Game.map;
  if (!map) return html.div("Waiting for map...");

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
