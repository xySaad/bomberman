export const clients = new Set();

export const getPlayersList = () => {
  return Array.from(clients.values()).map((player) => {
    return {
      nickname: player.nickname,
    };
  });
};

export const broadcast = (msg, excluded) => {
  clients.forEach((user) => {
    if (user !== excluded) {
      user.send(msg);
    }
  });
};
