export const players = new Set();

export const getPlayersList = () =>
  Array.from(players.values()).map((player) => ({
    nickname: player.nickname,
    position: player.position,
  }));

export const broadcast = (msg, excluded) => {
  players.forEach((user) => {
    if (user !== excluded) {
      user.send(msg);
    }
  });
};
