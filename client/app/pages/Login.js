import html, { state, router } from "rbind";
import { SelfUser, User } from "../state/user.js";
const { div, h1, input, button } = html;

const nickname = state("");
const ui = state({ state: "", error: "" });

const handleSubmit = async () => {
  const trimmed = nickname.value.trim();
  if (!trimmed) return alert("Please enter a nickname");

  const user = new User(trimmed);
  SelfUser(user);

  ui.value = { state: "loading" };

  try {
    await user.connect();
    router.navigate("/lobby");
    ui.value = { state: "success" };
  } catch (error) {
    ui.value = {
      state: "error",
      error: error?.message || "Connection failed.",
    };
  }
};

export const Login = () => {
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
      textContent: () =>
        ui.value.state === "loading" ? "Connecting..." : "Login",
      disabled: () => ui.value.state === "loading",
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
