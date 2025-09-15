# NATS per-message TTL issue reproduction

This repo demonstrates issue with NATS per message TTL not being respected when there's a constant traffic on stream.

## Setup

Prerequisites:
- Node 22
- Docker

```sh
npm install

docker compose up -d
```

## Instructions

A script will create a stream, start publishing messages with a specific rate, publish a test
message with TTL header, and then will periodically query a stream to see if that message was
replaced with a delete marker.

Press Ctrl+C to stop publishing the traffic, the state of the test message with TTL will still be
monitored. Press Ctrl+C again to exit.

To run with with default 100 msg/s:

```sh
node src/main.js
```

Adjust a number of messages per second being sent, e.g. with 2 msg/s, for which the test is passing:

```sh
MSG_PER_SECOND=2 node src/main.js
```

## Results

Message TTL is not working correctly with high message throughput - while messages are being
published on other subjects for a stream, TTL is not applied and message is not removed. Only when
messages are no longer sent, message is replaced with a subject delete marker.

```sh
node src/main.js
[12:46:02] Connected to NATS
[12:46:02] Stream created
[12:46:02] Publishing test messages with rate 100 msg/s
[12:46:12] Msg to expire - Seq: 2, Published: 10s ago, TTL: 15s, Is Delete Marker: false
[12:46:22] Msg to expire - Seq: 2, Published: 20s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
[12:46:32] Msg to expire - Seq: 2, Published: 30s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
[12:46:42] Msg to expire - Seq: 2, Published: 40s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
[12:46:52] Msg to expire - Seq: 2, Published: 50s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
[12:47:02] Msg to expire - Seq: 2, Published: 60s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
[12:47:12] Msg to expire - Seq: 2, Published: 70s ago, TTL: 15s, Is Delete Marker: false, TTL exceeded!
^C
[12:47:14] Stopping message publishing, press Ctrl+C again to stop expiration check...
[12:47:22] Msg to expire - Seq: 10202, Published: 8s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:47:32] Msg to expire - Seq: 10202, Published: 18s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:47:42] Msg to expire - Seq: 10202, Published: 28s ago, TTL: 1h0m0s, Is Delete Marker: true
```

Message TTL is working correctly with low message throughput, and a message is replaced with a
subject delete marker as expected.

```sh
MSG_PER_SECOND=2 node src/main.js
[12:48:32] Connected to NATS
[12:48:32] Stream created
[12:48:32] Publishing test messages with rate 2 msg/s
[12:48:42] Msg to expire - Seq: 2, Published: 10s ago, TTL: 15s, Is Delete Marker: false
[12:48:52] Msg to expire - Seq: 33, Published: 5s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:49:02] Msg to expire - Seq: 33, Published: 15s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:49:12] Msg to expire - Seq: 33, Published: 25s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:49:22] Msg to expire - Seq: 33, Published: 35s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:49:32] Msg to expire - Seq: 33, Published: 45s ago, TTL: 1h0m0s, Is Delete Marker: true
^C
[12:49:33] Stopping message publishing, press Ctrl+C again to stop expiration check...
[12:49:42] Msg to expire - Seq: 33, Published: 55s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:49:52] Msg to expire - Seq: 33, Published: 65s ago, TTL: 1h0m0s, Is Delete Marker: true
[12:50:02] Msg to expire - Seq: 33, Published: 75s ago, TTL: 1h0m0s, Is Delete Marker: true
```