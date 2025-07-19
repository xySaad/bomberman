import { Signal } from "./promise.js";

export class Mutex {
  #queue = [];
  constructor() {}
  async lock() {
    this.#queue.push(new Signal());
  }
  unlock() {}
}
