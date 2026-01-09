import { useCallback, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';

import { connect, createClient, disconnect } from '@/features/room/ws/stomp';

export type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
};

export function useRoomChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  const handleMessage = useCallback((payload: unknown) => {
    const next = payload as ChatMessage;
    setMessages((prev) => [...prev, next]);
  }, []);

  const open = useCallback(async () => {
    // TODO(9): Wire STOMP client connection and subscriptions.
    // - Why: chat panel needs real-time messages from the server.
    // - Steps: create client, connect, subscribe, push payloads.
    // - Done when: incoming server message appears in the list.
    const client = createClient({ roomId, onMessage: handleMessage });
    await connect(client);
    clientRef.current = client;
  }, [handleMessage, roomId]);

  const close = useCallback(async () => {
    if (!clientRef.current) return;
    await disconnect(clientRef.current);
    clientRef.current = null;
  }, []);

  const sendMessage = useCallback(async (_content: string) => {
    // TODO(9): Publish chat messages to STOMP topic.
    // - Why: outbound messages should broadcast to other members.
    // - Steps: serialize payload, publish to /pub chat destination.
    // - Done when: sent message echoes back into list.
    throw new Error('TODO');
  }, []);

  return {
    messages,
    open,
    close,
    sendMessage,
  };
}
