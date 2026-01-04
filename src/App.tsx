import { useEffect, useMemo, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type ChatMessage = {
  type: 'SYSTEM' | 'TEXT';
  roomId: string;
  sender: string;
  message: string;
  timestamp?: string;
};

export default function App() {
  // 백엔드 주소 (필요하면 env로 빼도 됨)
  const API_BASE = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);

  // 테스트용 입력값
  const [roomId, setRoomId] = useState('room-1');
  const [sender, setSender] = useState('user1');
  const [text, setText] = useState('');

  // 연결 상태 / 로그
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const clientRef = useRef<Client | null>(null);

  const addLog = (line: string) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev]);

  const connect = () => {
    if (clientRef.current?.active) {
      addLog('이미 연결되어 있어요.');
      return;
    }

    addLog(`연결 시도: ${API_BASE}/ws-stomp`);

    const socket = new SockJS(`/ws-stomp`);
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 3000,
      debug: () => {}, // 필요하면 console.log로 바꾸기
      onConnect: () => {
        setConnected(true);
        addLog('✅ CONNECTED');

        // 구독
        client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
          const msg = JSON.parse(frame.body) as ChatMessage;
          setMessages((prev) => [...prev, msg]);
        });

        // 입장 메시지 (옵션)
        client.publish({
          destination: `/pub/chat/room/${roomId}`,
          body: JSON.stringify({
            type: 'SYSTEM',
            roomId,
            sender,
            message: `${sender} joined`,
          } satisfies ChatMessage),
        });
      },
      onStompError: (frame) => {
        addLog(`❌ STOMP ERROR: ${frame.headers['message'] ?? ''}`);
        addLog(frame.body);
      },
      onWebSocketClose: () => {
        setConnected(false);
        addLog('🔌 WebSocket closed');
      },
      onWebSocketError: () => {
        setConnected(false);
        addLog('❌ WebSocket error');
      },
    });

    client.activate();
    clientRef.current = client;
  };

  const disconnect = () => {
    const c = clientRef.current;
    if (!c) return;

    c.deactivate();
    clientRef.current = null;
    setConnected(false);
    addLog('🛑 DISCONNECTED');
  };

  const send = () => {
    const c = clientRef.current;
    if (!c?.connected) {
      addLog('먼저 연결하세요.');
      return;
    }
    if (!text.trim()) return;

    c.publish({
      destination: `/pub/chat/room/${roomId}`,
      body: JSON.stringify({
        type: 'TEXT',
        roomId,
        sender,
        message: text.trim(),
      } satisfies ChatMessage),
    });

    setText('');
  };

  // roomId 바꾸면(구독 바뀌어야 하니까) 테스트 단계에서는 끊고 다시 연결 권장
  useEffect(() => {
    // 페이지 나갈 때 정리
    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 900 }}>
      <h2>WebSocket Chat Test (STOMP + SockJS)</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, opacity: 0.7 }}>API BASE</label>
          <input value={API_BASE} readOnly style={{ padding: 8, width: 260 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, opacity: 0.7 }}>roomId</label>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ padding: 8, width: 160 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, opacity: 0.7 }}>sender</label>
          <input value={sender} onChange={(e) => setSender(e.target.value)} style={{ padding: 8, width: 160 }} />
        </div>

        <button onClick={connect} disabled={connected} style={{ padding: '8px 12px' }}>
          Connect
        </button>
        <button onClick={disconnect} disabled={!connected} style={{ padding: '8px 12px' }}>
          Disconnect
        </button>

        <span style={{ marginLeft: 8 }}>
          상태: <b style={{ color: connected ? 'green' : 'crimson' }}>{connected ? 'CONNECTED' : 'DISCONNECTED'}</b>
        </span>
      </div>

      <hr style={{ margin: '18px 0' }} />

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 메시지 영역 */}
        <div style={{ flex: 2 }}>
          <h3 style={{ marginTop: 0 }}>Messages</h3>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              height: 320,
              overflow: 'auto',
              background: '#fafafa',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ opacity: 0.6 }}>아직 메시지가 없어요.</div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    [{m.type}] room={m.roomId} / {m.sender} {m.timestamp ? `@ ${m.timestamp}` : ''}
                  </div>
                  <div style={{ fontSize: 14 }}>{m.message}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
              placeholder='보낼 메시지 입력 후 Enter'
              style={{ padding: 10, flex: 1 }}
            />
            <button onClick={send} disabled={!connected} style={{ padding: '10px 14px' }}>
              Send
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            구독: <code>/sub/chat/room/{roomId}</code> / 발행: <code>/pub/chat/room/{roomId}</code>
          </div>
        </div>

        {/* 로그 영역 */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Logs</h3>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              height: 320,
              overflow: 'auto',
              background: '#fff',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ opacity: 0.6 }}>로그가 여기에 표시돼요.</div>
            ) : (
              logs.map((l, idx) => (
                <div key={idx} style={{ fontSize: 12, marginBottom: 6 }}>
                  {l}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setLogs([]);
              setMessages([]);
            }}
            style={{ marginTop: 10, padding: '8px 12px' }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
