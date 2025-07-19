export class User {
  #ws = null;
  get ws() {
    return this.#ws;
  }
  #events = {};
  destroy() {}
  constructor(ws) {
    this.#ws = ws;
    ws.on("close", () => this.destroy());
    ws.on("message", (raw) => {
      const data = JSON.parse(raw);
      this.#events[data.type]?.(data);
    });
  }

  on(event, handler) {
    this.#events[event] = handler;
  }
  send(data) {
    this.#ws.send(JSON.stringify(data));
  }
}
