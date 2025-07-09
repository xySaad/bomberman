export const players = new Set();

export const getPlayersList = () => {
  return Array.from(players.values()).map((player) => {
    return {
      nickname: player.nickname,
    };
  });
};

export const broadcast = (msg, excluded) => {
  players.forEach((user) => {
    if (user !== excluded) {
      user.send(msg);
    }
  });
};
