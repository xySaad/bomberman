import html, { router, state } from "rbind";
import { SelfUser, User } from "../state/user";
import { GameState } from "../state/game";
import { App } from "../App";
const { div, h2, p, input, span, button } = html;

export const Lobby = () => {
  if (SelfUser.state !== User.STATES.REGISTERED) return App();
  const { players, chatMessages, counter } = GameState;
  const message = state("");
  
  return div({ class: "Lobby" }).add(
    h2({ textContent: `Hello ${SelfUser.nickname}` }),
    p({ textContent: ($) => `Players in lobby: ${$(players).length}/4` }),
    p({
      textContent: ($) =>
        "Waiting for players" +
        ($(counter) !== null ? `: ${counter.value}s` : ""),
    }),
    div({ class: "Chat-Container" }).add(
      div({ class: "Chat-Messages" }).add(
        chatMessages.map((msg) =>
          div({ class: `message ${msg.alert && "alert"}` }).add(
            span({ class: "nickname", textContent: msg.nickname }),
            span({
              class: "text",
              textContent: msg.alert || `: ${msg.message}`,
            })
          )
        )
      ),
      input({
        is: { value: message },
        placeholder: "Enter your message",
        keydown: {
          enter: () => {
            if (message.value.trim().length > 0) {
              SelfUser.sendChat(message.value);
              message.value = "";
            }
          },
        },
      })
    ),
    button({
      textContent: "Start Game (debug only)",
      onclick: () => {
        SelfUser.state = User.STATES.READY;
        router.navigate("/play");
      },
    })
  );
};
