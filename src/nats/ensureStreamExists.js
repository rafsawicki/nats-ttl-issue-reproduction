import { log } from '../common/log.js';

export async function ensureStreamExists(jsm) {
  await jsm.streams.add({
    name: 'foo',
    subjects: ['foo.*'],
    max_age: 3600000000000,
    discard: 'old',
    max_msgs_per_subject: 1,
    allow_msg_ttl: true,
    subject_delete_marker_ttl: 3600000000000,
  });

  log('Stream created');
}
