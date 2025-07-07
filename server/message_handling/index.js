import { registerUser } from "./register.js";

export const handleWsMessage = (ws, data) => {
  switch (data.type) {
    case "register":
      return registerUser(ws, data);
    case "chat":
      const sender = clients.get(ws);
      if (!sender) return;

      broadcast({
        type: "chat",
        nickname: sender.nickname,
        message: data.message,
      });
      break;

    default:
      break;
  }
};
