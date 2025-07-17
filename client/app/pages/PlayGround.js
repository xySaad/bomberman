import html from "rbind";
import { GameState } from "../state/game";
import { SelfUser, User } from "../state/user";
import { App } from "../App";
const { div, span } = html;
const getClass = ["wall", "ground", "box", "unbreakable"];
const allowedKeys = [
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
  "Space",
];
onkeydown = ({ code }) => {
  if (allowedKeys.includes(code)) {
    SelfUser.send({
      type: "player_input",
      input: code,
    });
  }
};
export const PlayGround = () => {
  if (SelfUser.state !== User.STATES.READY) return App();

  const { players, map, bombs, powerUps, explosions } = GameState;
  const TILE_SIZE = 42;
  const GAP = 2;
  const OFFSET = TILE_SIZE + GAP;

  return div({ class: "playground" }).add(
    div({ class: "grid-wrapper" }).add(
      div({ class: "playground-grid" }).add(
        ...map.map((row) =>
          row.map((block) => div({ class: ($) => getClass[$(block.$.type)] }))
        )
      ),
      bombs.map((bomb) => {
        const pos = bomb.$.position;
        return div({
          class: "bomb",
          style: ($) => {
            const { x, y } = $(pos);
            return `transform: translate(${x * OFFSET}px, ${y * OFFSET}px);`;
          },
        });
      }),
      explosions.map((e) => {
        return div({
          class: "explosion",
          style: `transform: translate(${e.x * OFFSET}px, ${e.y * OFFSET}px);`
        });
      }),
      powerUps.map((powerUp) => {
        const pos = powerUp.$.position;
        console.log(powerUp);
          const type = powerUp.$.type.value;
          console.log(type);
          
        return div({
         class: `powerup ${type}`,
          style: ($) => {
            const { x, y } = $(pos);
            return `transform: translate(${x * OFFSET}px, ${y * OFFSET}px);`;
          },
        });
      }),
      players.map((player) => {
        const pos = player.$.position;
        return div({
          class: "player",
          style: ($) => {
            const { x, y } = $(pos);
            return `transform: translate(${x * OFFSET}px, ${y * OFFSET}px);`;
          },
        });
      })
    )
    //  StatsDisplay()
  );
};

// const StatsDisplay = () => {
//   const stats = GameState.playerStats;
//   console.log(stats.maxBombs);

//   return div({ class: "stats-display" }).add(
//     div({ class: "stat-item" }).add(
//       span({ class: "stat-label" }, "💣 Bombs: "),
//       span({ class: "stat-value" }, ($) => $(stats).maxBombs)
//     ),
//     div({ class: "stat-item" }).add(
//       span({ class: "stat-label" }, "❤️ Health: "),
//       span({ class: "stat-value" }, ($) => $(stats).health)
//     ),
//     div({ class: "stat-item" }).add(
//       span({ class: "stat-label" }, "⚡ Speed: "),
//       span({ class: "stat-value" }, ($) => $(stats).speed)
//     ),
//     div({ class: "stat-item" }).add(
//       span({ class: "stat-label" }, "💥 Radius: "),
//       span({ class: "stat-value" }, ($) => $(stats).bombRadius)
//     )
//   );
// };
