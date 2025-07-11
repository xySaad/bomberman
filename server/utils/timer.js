import { Signal } from "./promise.js";

export class Timer {
  #intervalId = null;
  #counter = 0;
  #callback = null;
  #signal = null;
  constructor(callback) {
    this.#callback = callback;
  }
  // start a timer with the specified time in seconds.
  async start(sec) {
    this.#signal = new Signal();
    this.#counter = sec;
    this.#intervalId = setInterval(() => {
      this.#callback(this.#counter--);
      if (this.#counter === 0) this.stop();
    }, 1000);
    await this.#signal.promise;
  }
  // skip the remaining time and stop the timer as finished
  stop(result) {
    clearInterval(this.#intervalId);
    this.#signal.resolve(result);
  }
  // cancel the timer as unfinished
  cancel(reason) {
    clearInterval(this.#intervalId);
    this.#signal?.reject(reason);
  }
  // resume from the last second
  async resume() {
    await this.start(this.#counter);
  }
}
