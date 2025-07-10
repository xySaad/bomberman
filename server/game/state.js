import { GameMap } from "./map.js";
import { broadcast, players } from "../network/players.js";

export const GAME_STATES = {
  INIT: 0,
  WAITING: 1,
  GETTING_READY: 2,
  STARTED: 3,
  ENDED: 4,
};

const map = new GameMap(15, 15);

export const GameState = {
  minPlayers: 2,
  maxPlayers: 4,
  map: map.generate(),
  state: GAME_STATES.WAITING,
  cancelCountdown: null,
};

export const startCountdown = (sec) => {
  let resolver;
  let interval;
  const untilTimerFinish = new Promise((resolve) => {
    resolver = resolve;
    let counter = sec;
    interval = setInterval(() => {
      broadcast({ type: "counter", counter: counter-- });
      if (counter === 0) {
        resolve();
        clearInterval(interval);
      }
    }, 1000);
  });

  const cancelTimer = () => {
    clearInterval(interval);
    resolver();
  };

  return [untilTimerFinish, cancelTimer];
};

export const updateCountdown = async () => {
  if (players.size === GameState.minPlayers) {
    const [untilTimerFinish, cancelTimer] = startCountdown(20);
    GameState.cancelCountdown = cancelTimer;
    await untilTimerFinish;
    const [readyFinished] = startCountdown(10);
    await readyFinished;

    GameState.state = GAME_STATES.STARTED;
    broadcast({ type: "game_started" });
  } else if (players.size === GameState.maxPlayers) {
    GameState.cancelCountdown?.();
  }
};
