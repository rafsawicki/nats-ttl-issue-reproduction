import assert from 'node:assert';
import { waitFor } from '../common/waitFor.js';
import { getOptions } from '../options.js';
import { log } from '../common/log.js';

const { msgToExpireId } = getOptions();

export async function checkIfMsgExpired(jsm, signal) {
  while (!signal.aborted) {
    await waitFor(10000, signal);

    const message = await jsm.streams.getMessage('foo', {
      last_by_subj: `foo.${msgToExpireId}`,
    });

    if (message) {
      const publishedSecondsAgo = Math.floor((Date.now() - message.time.getTime()) / 1000);
      const isDeleteMarker = message.data.length === 0;

      const ttl = message.header.get('Nats-TTL');
      assert(ttl?.endsWith('s'), 'TTL must end with s');
      const ttlSeconds = parseInt(ttl.replace('s', ''));

      let line = `Msg to expire - Seq: ${
        message.seq
      }, Published: ${publishedSecondsAgo}s ago, TTL: ${message.header.get(
        'Nats-TTL'
      )}, Is Delete Marker: ${isDeleteMarker}`;

      if (!isDeleteMarker && publishedSecondsAgo > ttlSeconds) {
        line += `, TTL exceeded!`;
      }
      log(line);
    } else {
      log(`Message not found for subject foo.${msgToExpireId}`);
    }
  }
}
