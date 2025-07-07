import { clients } from "../index.js";

export const registerUser = (ws, data) => {
  if (!data.nickname) return;
  clients.set(ws, { nickname: data.nickname });
  return {
    type: "registered",
    nickname: data.nickname,
  };
};
