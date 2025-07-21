import { router } from "rbind";
import { SelfUser, User } from "./state/user.js";

export const App = () => {  
  switch (SelfUser.state) {
    case User.STATES.CONNECTED:
      router.navigate("/login");
      break;
    case User.STATES.REGISTERED:
      router.navigate("/lobby");

    case User.STATES.READY:
      router.navigate("/play");

    default:
      console.error("route not found ");
      break;
  }
  return "";
};
