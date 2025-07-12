import html, { state, router } from "rbind";
import { SelfUser, User } from "../state/user.js";
import { App } from "../App.js";
const { div, h1, input, button } = html;

const nickname = state("");
const ui = state({ state: "", error: "" });

const handleSubmit = async () => {
  try {
    const trimmed = nickname.value.trim();
    if (!trimmed) return alert("Please enter a nickname");
    ui.value = { state: "loading" };

    await SelfUser.connect(trimmed);
    ui.value = { state: "success" };
    router.navigate("/lobby");
  } catch (error) {    
    ui.value = {
      state: "error",
      error: error || "Connection failed.",
    };
  }
};

export const Login = () => {
  if (SelfUser.state !== User.STATES.CONNECTED) return App();
  return div({ class: "LoginPage" }).add(
    h1({ textContent: "Enter your nickname" }),
    input({
      type: "text",
      placeholder: "Nickname",
      class: "nickname-input",
      is: { value: nickname },
      keydown: { enter: handleSubmit },
    }),
    button({
      textContent: "Login",
      onclick: handleSubmit,
    }),
    div({ class: "feedback" }).add(($) => {
      switch ($(ui).state) {
        case "loading":
          return div({ class: "loading", textContent: "Connecting..." });
        case "error":
          return div({ class: "error", textContent: ui.value.error });
      }
    })
  );
};
