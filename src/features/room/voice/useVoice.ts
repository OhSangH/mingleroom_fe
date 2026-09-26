import { useCallback, useEffect, useRef, useState } from 'react';
export type VoiceSignal={type:'JOIN'|'LEAVE'|'HELLO'|'OFFER'|'ANSWER'|'ICE';sender?:number;target?:number;data?:unknown};
type Peer={pc:RTCPeerConnection;audio:HTMLAudioElement;seen:number;candidates:RTCIceCandidateInit[];queue:Promise<void>};
export function useVoice(userId:number,send:(signal:VoiceSignal)=>boolean,connected:boolean,forcedMute:boolean){
 const [active,setActive]=useState(false),[muted,setMuted]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[peers,setPeers]=useState<{id:number;state:string}[]>([]);
 const stream=useRef<MediaStream|null>(null),connections=useRef(new Map<number,Peer>()),generation=useRef(0),sendRef=useRef(send),forced=useRef(forcedMute);sendRef.current=send;forced.current=forcedMute;
 const sync=()=>setPeers([...connections.current].map(([id,p])=>({id,state:p.pc.connectionState})));
 const drop=(id:number)=>{const p=connections.current.get(id);if(!p)return;p.pc.onconnectionstatechange=null;p.pc.onicecandidate=null;p.pc.ontrack=null;p.pc.close();p.audio.pause();p.audio.srcObject=null;connections.current.delete(id);sync();};
 const stop=useCallback(()=>{generation.current++;sendRef.current({type:'LEAVE'});for(const id of [...connections.current.keys()])drop(id);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setActive(false);setBusy(false);setMuted(false);},[]);
 useEffect(()=>()=>stop(),[stop]);
 useEffect(()=>{if(!connected)stop();},[connected,stop]);
 useEffect(()=>{if(forcedMute){stream.current?.getAudioTracks().forEach(t=>t.enabled=false);setMuted(true);}},[forcedMute]);
 const start=async()=>{if(!connected)return;const g=++generation.current;setBusy(true);setError('');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('음성은 HTTPS 또는 localhost에서 사용할 수 있어요.');const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(g!==generation.current){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;s.getAudioTracks().forEach(t=>t.enabled=!forced.current);setMuted(forced.current);setActive(true);sendRef.current({type:'JOIN'});}catch(e){if(g===generation.current)setError((e as Error).message);}finally{if(g===generation.current)setBusy(false);}};
 const signal=useCallback((raw:unknown)=>{
  const s=raw as VoiceSignal;const id=s?.sender;if(!stream.current||!Number.isSafeInteger(id)||id===userId||(s.target!=null&&s.target!==userId))return;
  const peerId=id as number;
  if(s.type==='LEAVE'){drop(peerId);return;}
  let peer=connections.current.get(peerId);
  if(!peer){if(connections.current.size>=3){setError('음성 MVP는 최대 4명까지 연결합니다.');return;}if(s.type!=='JOIN'&&s.type!=='HELLO'&&s.type!=='OFFER')return;
   let iceServers:RTCIceServer[]=[];try{iceServers=JSON.parse(import.meta.env.VITE_RTC_ICE_SERVERS||'[]');if(!Array.isArray(iceServers))throw new Error();}catch{setError('VITE_RTC_ICE_SERVERS 설정을 확인하세요.');return;}
   const pc=new RTCPeerConnection({iceServers}),audio=new Audio();audio.autoplay=true;peer={pc,audio,seen:Date.now(),candidates:[],queue:Promise.resolve()};connections.current.set(peerId,peer);stream.current.getTracks().forEach(t=>pc.addTrack(t,stream.current!));
   pc.onicecandidate=e=>{if(e.candidate)sendRef.current({type:'ICE',target:peerId,data:e.candidate.toJSON()});};
   pc.ontrack=e=>{audio.srcObject=e.streams[0]||new MediaStream([e.track]);void audio.play().catch(()=>setError('브라우저가 소리 재생을 막았습니다. 아래 소리 재생 버튼을 눌러 주세요.'));};
   pc.onconnectionstatechange=()=>{sync();if(pc.connectionState==='failed'){setError('음성 연결에 실패했습니다. 다른 네트워크에서는 STUN/TURN 설정을 확인하세요.');drop(peerId);}};sync();
  }
  peer.seen=Date.now();const p=peer;
  p.queue=p.queue.then(async()=>{if(connections.current.get(peerId)!==p)return;
   if(s.type==='JOIN')sendRef.current({type:'HELLO',target:peerId});
   if((s.type==='JOIN'||s.type==='HELLO')&&userId<peerId&&!p.pc.localDescription){await p.pc.setLocalDescription(await p.pc.createOffer());sendRef.current({type:'OFFER',target:peerId,data:p.pc.localDescription});}
   if(s.type==='OFFER'){if(userId<peerId)return;await p.pc.setRemoteDescription(s.data as RTCSessionDescriptionInit);await p.pc.setLocalDescription(await p.pc.createAnswer());sendRef.current({type:'ANSWER',target:peerId,data:p.pc.localDescription});}
   if(s.type==='ANSWER')await p.pc.setRemoteDescription(s.data as RTCSessionDescriptionInit);
   if(s.type==='ICE'){if(p.pc.remoteDescription)await p.pc.addIceCandidate(s.data as RTCIceCandidateInit);else p.candidates.push(s.data as RTCIceCandidateInit);}
   if(p.pc.remoteDescription){for(const c of p.candidates.splice(0))await p.pc.addIceCandidate(c);}
  }).catch(()=>{setError('음성 연결 협상에 실패했습니다. 음성을 나간 뒤 다시 참여해 주세요.');drop(peerId);});
 },[userId]);
 useEffect(()=>{if(!active)return;const t=setInterval(()=>{sendRef.current({type:'JOIN'});for(const [id,p] of connections.current)if(Date.now()-p.seen>16000)drop(id);},5000);return()=>clearInterval(t);},[active]);
 const toggle=()=>{if(forced.current)return;setMuted(v=>{stream.current?.getAudioTracks().forEach(t=>t.enabled=v);return !v;});};
 const play=()=>{for(const p of connections.current.values())void p.audio.play().catch(()=>setError('소리 재생을 허용해 주세요.'));setError('');};
 return {active,muted,busy,error,peers,start,stop,toggle,signal,play};
}
