import html, { state } from "rbind";
import { SelfUser, User } from "../state/user";
import { GameState } from "../state/game";
import { App } from "../App";
const { div, h2, p, input, span } = html;

export const Lobby = () => {
  const message = state("");
  if (SelfUser.state !== User.STATES.REGISTERED) return App();
  const { players, chatMessages } = GameState;

  return div({ class: "Lobby" }).add(
    h2({ textContent: `Hello ${SelfUser.nickname}` }),
    p({ textContent: ($) => `Players in lobby: ${$(players).length}/4` }),
    div({ class: "Chat-Container" }).add(
      div({ class: "Chat-Messages" }).add(
        chatMessages.map((msg) =>
          div({ class: "message" }).add(
            span({ class: "nickname", textContent: msg.nickname }),
            span({ class: "text", textContent: `: ${msg.message}` })
          )
        )
      ),
      input({
        is: { value: message },
        placeholder: "Enter your message",
        onkeyup: (e) => {
          if (e.key == "Enter" && message.value.trim().length > 0) {
            SelfUser.sendChat(message.value);
            message.value = "";
          }
        },
      })
    )
  );
};
