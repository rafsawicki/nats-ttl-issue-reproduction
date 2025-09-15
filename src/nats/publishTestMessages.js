import { getOptions } from '../options.js';
import { waitFor } from '../common/waitFor.js';
import { log } from '../common/log.js';

const { maxMessageId, msgPerSecond } = getOptions();

export async function publishTestMessages(js, signal) {
  let id = 0;

  log(`Publishing test messages with rate ${msgPerSecond} msg/s`);
  while (!signal.aborted) {
    js.publish(`foo.${id}`, `{"id": ${id}}`, { ttl: `15s` });

    id += 1;
    if (++id === maxMessageId) {
      id = 0;
    }

    await waitFor(1000 / msgPerSecond, signal);
  }
}
