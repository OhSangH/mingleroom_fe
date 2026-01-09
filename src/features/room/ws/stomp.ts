import type { Client } from '@stomp/stompjs';

export type StompConfig = {
  roomId: string;
  onMessage: (payload: unknown) => void;
};

export function createClient(_config: StompConfig): Client {
  // TODO(8): Create and configure the STOMP client instance.
  // - Why: chat requires a live socket connection per room.
  // - Steps: set broker URL, reconnect strategy, and handlers.
  // - Done when: client connects and logs onConnect callback.
  throw new Error('TODO');
}

export async function connect(_client: Client) {
  // TODO(8): Connect and subscribe to room topics.
  // - Why: chat and events need to stream from the server.
  // - Steps: activate client, subscribe to topics, parse messages.
  // - Done when: incoming payloads update the message list.
  throw new Error('TODO');
}

export async function disconnect(_client: Client) {
  // TODO(8): Disconnect cleanly from STOMP server.
  // - Why: avoid lingering subscriptions and memory leaks.
  // - Steps: unsubscribe, deactivate client, reset local state.
  // - Done when: client reports deactivated state.
  throw new Error('TODO');
}
