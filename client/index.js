import { router } from "rbind";
import { App } from "./app/App.js";
import { Login } from "./app/pages/Login.js";
import { Lobby } from "./app/pages/Lobby.js";
import { PlayGround } from "./app/pages/PlayGround.js";

router.SetRoute("/", App);
router.SetRoute("/login", Login);
router.SetRoute("/lobby", Lobby);
router.SetRoute("/play", PlayGround);
