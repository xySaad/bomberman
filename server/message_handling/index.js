import { registerUser } from "./register.js";
import { clients } from "../index.js";

export const handleWsMessage = (ws, data) => {
  switch (data.type) {
    case "register":
      return registerUser(ws, data);
    case "chat": {
      const sender = clients.get(ws);
      if (!sender) return;
      return {
        type: "chat",
        nickname: sender.nickname,
        message: data.message,
      };
    }
    default:
      break;
  }
};
