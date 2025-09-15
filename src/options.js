export function getOptions() {
  const msgPerSecond = process.env.MSG_PER_SECOND ? Number(process.env.MSG_PER_SECOND) : 100;

  return {
    msgPerSecond,
    msgToExpireId: 20001,
    maxMessageId: 20000,
  };
}
