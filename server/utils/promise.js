export class Signal {
  #resolver = null;
  #rejecter = null;
  promise = new Promise((resolve, reject) => {
    this.#resolver = resolve;
    this.#rejecter = reject;
  });
  resolve() {
    this.#resolver();
  }
  reject() {
    this.#rejecter();
  }
}
