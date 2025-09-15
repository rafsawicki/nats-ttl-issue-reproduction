import { getOptions } from '../options.js';

const { msgToExpireId } = getOptions();

export async function publishMsgToExpire(js) {
  await js.publish(`foo.${msgToExpireId}`, `{"id": ${msgToExpireId}}`, { ttl: `15s` });
}
