import html from "rbind";
import { SelfUser, User } from "../state/user";
import { GameState } from "../state/game";
import { App } from "../App";
const { div, h2, p } = html;

export const Lobby = () => {
  if (SelfUser.state !== User.STATES.REGISTERED) return App();
  const players = GameState.players;

  return div({ class: "Lobby" }).add(
    h2({ textContent: `Hello ${SelfUser.nickname}` }),
    p({ textContent: ($) => `Players in lobby: ${$(players).length}/4` }),
    p({ textContent: "" })
  );
};
