import html, { router } from "rbind";
import { GameState } from "../state/game";
import { SelfUser, User } from "../state/user";
import { App } from "../App";
const { div, span, button } = html;
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
      active: true,
    });
    const direction = code.split("Arrow")[1]
    if (direction) {
      const player = GameState.players.value.find(p => p.nickname === SelfUser.nickname)
      player.direction = direction.toLowerCase()
    }
  }
};

onkeyup = ({ code }) => {
  if (allowedKeys.includes(code)) {
    SelfUser.send({
      type: "player_input",
      input: code,
      active: false,
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
    GameEndedScreen(),
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
          style: `transform: translate(${e.x * OFFSET}px, ${e.y * OFFSET}px);`,
        });
      }),
      powerUps.map((powerUp) => {
        const pos = powerUp.$.position;
        const type = powerUp.$.type.value;
        return div({
          class: `powerup ${type}`,
          style: ($) => {
            const { x, y } = $(pos);
            return `transform: translate(${x * OFFSET}px, ${y * OFFSET}px);`;
          },
        });
      }),
      players.map((player) => {
        const { direction, position, isMoving, isDead } = player.$;


        return div({
          class: ($) => {
            if ($(isDead)) return "player dead";
            if ($(player.$.damaged)) return "player damaged";
            if (!$(isMoving)) return "player idle";
            return `player ${$(direction)}`;
          },
          style: ($) => {
            const { x, y } = $(position);
            return `transform: translate(${x * OFFSET}px, ${y * OFFSET
              }px) ;`;
          },
        });
      })
    ),
    StatsDisplay(),
  );
};


const StatsDisplay = () => {
  const stats = GameState.playerStats;

  return div({ class: "stats-display" }).add(
    div({ class: "stat-item" }).add(
      span({ class: "stat-label", textContent: "💣 Bombs: " }),
      span({ class: "stat-value", textContent: ($) => $(stats).maxBombs })
    ),
    div({ class: "stat-item" }).add(
      span({ class: "stat-label", textContent: "❤️ Health: " }),
      span({ class: "stat-value", textContent: (($) => `${$(stats).health}`) })
    ),
    div({ class: "stat-item" }).add(
      span({ class: "stat-label", textContent: "⚡ Speed: " }),
      span({ class: "stat-value", textContent: ($) => $(stats).speed })
    ),
    div({ class: "stat-item" }).add(
      span({ class: "stat-label", textContent: "💥 Radius: " }),
      span({ class: "stat-value", textContent: ($) => $(stats).bombRadius })
    )
  );
};

const GameEndedScreen = () => {
  return div({ class: "game-end-screen", "data-game-ended": ($) => $(GameState.gameEnded) }).add(
    div({ class: "game-end-content" }).add(
      div({
        class: "game-end-title",
        textContent: ($) => `${$(GameState.gameWinner)} Won! 🏆`
      }),
      div({
        class: "game-end-subtitle",
        textContent: "Game Over"
      })
    ),
    div({ class: "play-again" }).add(
      button({
        class: "play-again-btn",
        textContent: "Play Again",
        onclick: async () => {
          GameState.reset()
          await SelfUser.connect(SelfUser.nickname)
          router.navigate("/lobby")
        },
      })
    )
  );
};