export const throttle = (delay, fn) => {
  let lastInvoke = 0;
  let timeoutId = 0;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      lastInvoke = performance.now();
    }, delay - (performance.now() - lastInvoke));
  };
};
