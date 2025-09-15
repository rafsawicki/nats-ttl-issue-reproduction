export const log = (msg, newline = false) => {
  if (newline) console.log();

  console.log(`[${new Date().toISOString().slice(11, 19)}]`, msg);
};
