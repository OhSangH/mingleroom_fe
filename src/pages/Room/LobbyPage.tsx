import 'webrtc-adapter';

import { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function LobbyPage() {
  const { roomId = '' } = useParams();
  const [nickname, setNickname] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const handleJoin = () => {
    // TODO(10): WebRTC 미디어 미리보기와 참가 흐름 구현.
    // - 이유: 로비에서 입장 전 마이크/카메라를 확인해야 함.
    // - 단계: 미디어 요청, 미리보기 렌더링, 권한 처리.
    // - 완료 조건: 사용자가 마이크 상태를 확인하고 룸에 입장 가능함.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[color:var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">로비</p>
        <h1 className="mt-3 text-3xl font-semibold">회의실 {roomId}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">입장 전에 오디오 설정을 확인하세요.</p>

        <div className="mt-8 w-full space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <TextField
            label="표시 이름"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            fullWidth
          />
          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
            <span className="text-sm text-[color:var(--muted-foreground)]">마이크</span>
            <IconButton onClick={() => setMicEnabled((prev) => !prev)} color="primary">
              {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </IconButton>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
            <span className="text-sm text-[color:var(--muted-foreground)]">스피커</span>
            <IconButton onClick={() => setSpeakerEnabled((prev) => !prev)} color="primary">
              {speakerEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </IconButton>
          </div>
          <Button variant="contained" fullWidth onClick={handleJoin}>
            회의실 입장
          </Button>
        </div>
      </div>
    </div>
  );
}
