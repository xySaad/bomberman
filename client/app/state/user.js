import { UserState } from "../types/user";
import { ref } from "rbind";
import { GameSocket } from "./gamesocket";

export class User {
  state = UserState.INIT;
  name = "";
  socket = null;

  constructor(name) {
    this.name = name;
  }

  async connect(serverUrl = "ws://localhost:3000") {
    await new Promise((resolve, reject) => {
      this.socket = new GameSocket(serverUrl, { resolve, reject });
    });
    this.socket.sendMessage({ type: "register", nickname: this.name });
  }

  sendChat(message) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message,
      })
    );
  }
}

export const SelfUser = ref(new User());
