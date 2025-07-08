import html, { router } from "rbind";
import { SelfUser } from "../state/user";
import { Game } from "../state/game";
const { div, h2, p ,button} = html;

export const Lobby = () => {
  const players = Game.players;
console.log(players);

  return div({ class: "Lobby" }).add(
    h2({ textContent: `Hello ${SelfUser().name}` }),
    p({ textContent: ($) => `Players in lobby: ${$(players).length}/4` }),
    p({ textContent: "" }),
    button({
      textContent: "Start Game",
      onclick: () => {router.navigate("/play");}
    })
  );
};
