import { jetstream, jetstreamManager } from '@nats-io/jetstream';
import { connect } from '@nats-io/transport-node';
import { checkIfMsgExpired } from './nats/checkIfMsgExpired.js';
import { publishMsgToExpire } from './nats/publishMsgToExpire.js';
import { publishTestMessages } from './nats/publishTestMessages.js';
import { ensureStreamExists } from './nats/ensureStreamExists.js';
import { log } from './common/log.js';

const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';

const nc = await connect({
  servers: [natsUrl],
});

const js = jetstream(nc);
const jsm = await jetstreamManager(nc);

log('Connected to NATS');

await ensureStreamExists(jsm);

const sendController = new AbortController();
const expirationController = new AbortController();

const stopMessagePublishing = () => {
  if (!sendController.signal.aborted) {
    log('Stopping message publishing, press Ctrl+C again to stop expiration check...', true);
    sendController.abort();
  }
};
const stopMessageExpirationChecking = () => {
  if (!expirationController.signal.aborted) {
    log('Stopping message expiration checking...', true);
    expirationController.abort();
  }
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    if (!sendController.signal.aborted) {
      stopMessagePublishing();
    } else if (!expirationController.signal.aborted) {
      stopMessageExpirationChecking();
    } else {
      log('Stopping...', true);
      nc.close();
    }
  });
});

// waitFor(60000, sendController.signal).then(() => {
//   stopMessagePublishing();
// });

// waitFor(80000, expirationController.signal).then(() => {
//   stopMessageExpirationChecking();
// });

await Promise.all([
  publishTestMessages(js, sendController.signal),
  publishMsgToExpire(js),
  checkIfMsgExpired(jsm, expirationController.signal),
]);

nc.close();
