import html, { state } from "rbind";
import { SelfUser } from "../state/user";
import { Game } from "../state/game";
const { div, h2, p, input, span } = html;

export const Lobby = () => {
  const message = state("");
  const players = Game.players;
  const chatMessages = Game.chatMessages;

  return div({ class: "Lobby" }).add(
    h2({ textContent: `Hello ${SelfUser().name}` }),
    p({ textContent: ($) => `Players in lobby: ${$(players).length}/4` }),
    div({ class: "Chat-Container" }).add(
      div({
        class: "Chat-Messages",
        textContent: (w) => {
          const msgs = w(chatMessages);
          if (!msgs.length) return "No messages yet.";
          return msgs
            .map((msg) => `${msg.nickname}: ${msg.message}`)
            .join("\n");
        },
      }),
      input({
        is: { value: message },
        placeholder: "Enter your message",
        onkeyup: (e) => {
          if (e.key == "Enter" && message.value.trim().length > 0) {
            SelfUser().sendChat(message.value);
            message.value = "";
          }
        },
      })
    )
  );
};
