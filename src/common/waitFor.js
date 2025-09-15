export const waitFor = (ms, signal) => {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms);

    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
};
