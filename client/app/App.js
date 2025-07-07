import { router } from "rbind";
import { SelfUser } from "./state/user.js";
import { UserState } from "./types/user.js";

export const App = () => {
  switch (SelfUser().state) {
    case UserState.INIT:
      router.navigate("/login");
      break;
    default:
      break;
  }
  return ""
};
