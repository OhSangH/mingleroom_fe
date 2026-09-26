import { useRef, useState, type PointerEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip } from '@mui/material';
import { CheckCheck, Download, Maximize2, Minus, MousePointer2, Plus, SquarePen, StickyNote, Trash2, X } from 'lucide-react';
import type { RoomRole } from '../api';
import type { Sticky, StickyEdit, useBoard } from './useBoard';
type Props={model:ReturnType<typeof useBoard>;role:RoomRole;userId:number;sendCursor:(x:number,y:number)=>void;connected:boolean};
const colors=['yellow','purple','green','pink'] as const;
export default function Whiteboard({model,role,userId,sendCursor,connected}:Props){
 const {board,error,saving,save,peers}=model;
 const [selected,setSelected]=useState('');
 const [zoom,setZoom]=useState(.8),[edit,setEdit]=useState<Sticky|null>(null),[text,setText]=useState(''),[color,setColor]=useState<Sticky['color']>('yellow'),[showCursors,setShowCursors]=useState(true);
 const [position,setPosition]=useState<{id:string;x:number;y:number}|null>(null);
 const canvas=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const drag=useRef<{note:Sticky;px:number;py:number;x:number;y:number;moved:boolean}|null>(null);
 const canEdit=(n:Sticky)=>role!=='MEMBER'||n.authorId===userId;
 const open=(n:Sticky)=>{if(!canEdit(n))return;setEdit(n);setText(n.text);setColor(n.color);};
 const add=()=>{const x=Math.min(1040,Math.max(40,(stage.current?.scrollLeft??0)/zoom+80+(board.notes.length%4)*70)),y=Math.min(650,Math.max(100,(stage.current?.scrollTop??0)/zoom+150+(board.notes.length%3)*85));open({id:crypto.randomUUID(),text:'',color:colors[board.notes.length%4],x,y,authorId:userId,author:'나',revision:0});};
 const commit=async()=>{if(!edit||!text.trim())return;const value:StickyEdit={text:text.trim(),color,x:edit.x,y:edit.y,revision:edit.revision};if(await save(edit.id,value))setEdit(null);};
 const down=(e:PointerEvent,n:Sticky)=>{setSelected(n.id);if(!canEdit(n)||saving||(e.target as HTMLElement).closest('button'))return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={note:n,px:e.clientX,py:e.clientY,x:n.x,y:n.y,moved:false};};
 const move=(e:PointerEvent)=>{if(canvas.current){const r=canvas.current.getBoundingClientRect();const x=(e.clientX-r.left)/zoom,y=(e.clientY-r.top)/zoom;if(x>=0&&x<=1280&&y>=0&&y<=850)sendCursor(x,y);}
  const d=drag.current;if(!d)return;const dx=(e.clientX-d.px)/zoom,dy=(e.clientY-d.py)/zoom;if(Math.abs(dx)+Math.abs(dy)>4)d.moved=true;d.x=Math.max(0,Math.min(1040,d.note.x+dx));d.y=Math.max(0,Math.min(650,d.note.y+dy));setPosition({id:d.note.id,x:d.x,y:d.y});};
 const up=()=>{const d=drag.current;drag.current=null;if(d?.moved){void save(d.note.id,{text:d.note.text,color:d.note.color,x:d.x,y:d.y,revision:d.note.revision}).finally(()=>setPosition(null));}else setPosition(null);};
 const exportPng=()=>{const c=document.createElement('canvas');c.width=1280;c.height=850;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#f5f8f5';ctx.fillRect(0,0,1280,850);ctx.fillStyle='#204f3d';ctx.font='bold 24px sans-serif';ctx.fillText('MingleRoom · 아이디어 보드',40,55);const palette={yellow:'#fff0ad',purple:'#e9dafa',green:'#d7eccb',pink:'#ffdce8'};for(const n of board.notes){ctx.fillStyle=palette[n.color];ctx.fillRect(n.x,n.y,230,190);ctx.fillStyle='#28382e';ctx.font='18px sans-serif';let line='',y=n.y+36;for(const char of n.text){if(char==='\n'||ctx.measureText(line+char).width>198){ctx.fillText(line,n.x+16,y);line='';y+=25;if(y>n.y+145)break;if(char==='\n')continue;}line+=char;}if(y<=n.y+145)ctx.fillText(line,n.x+16,y);ctx.font='13px sans-serif';ctx.fillText(n.author,n.x+16,n.y+176);}c.toBlob(blob=>{if(!blob)return;const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='mingleroom-board.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});};
 const current=edit?board.notes.find(n=>n.id===edit.id):undefined;
 const conflict=!!edit&&edit.revision>0&&(!current||current.revision!==edit.revision);
 return <section className="mr-board" aria-label="공동 화이트보드">
  <div className="mr-board-head"><span><StickyNote size={18}/><strong>화이트보드</strong><span className="mr-count">{board.notes.length}</span></span><div><span className="mr-save"><CheckCheck size={14}/>{saving?'저장 중…':board.version<0?'불러오는 중':connected?'변경사항 저장됨':'4초마다 동기화'}</span><Tooltip title="보드 PNG 내보내기"><IconButton aria-label="보드 PNG 내보내기" disabled={board.version<0} onClick={exportPng}><Download size={17}/></IconButton></Tooltip><Tooltip title="커서 표시"><IconButton aria-label="커서 표시" aria-pressed={showCursors} onClick={()=>setShowCursors(v=>!v)}><MousePointer2 size={17}/></IconButton></Tooltip></div></div>
  {error&&<Alert severity="warning" action={<Button onClick={()=>void model.reload()}>새로고침</Button>}>{error}</Alert>}
  <div className="mr-stage" ref={stage} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null;setPosition(null);}}>
   <div className="mr-canvas-space" style={{width:1280*zoom,height:850*zoom}}><div className="mr-canvas" ref={canvas} style={{transform:`scale(${zoom})`}}>
    <div className="mr-canvas-heading"><span>THINK TOGETHER</span><h2>생각을 펼쳐볼까요?</h2><p>작은 아이디어도 좋아요. 노트에 적고 함께 움직여보세요.</p></div>
    {board.version>=0&&!board.notes.length&&<div className="mr-empty-board"><div className="mr-empty-note"><StickyNote size={36}/></div><h3>첫 번째 아이디어를 기다려요</h3><p>노트 하나에서 이야기가 시작됩니다.</p><Button variant="contained" startIcon={<Plus size={17}/>} disabled={saving} onClick={add}>첫 노트 추가</Button></div>}
    {board.notes.map(n=><article key={n.id} className={`mr-sticky ${n.color} ${canEdit(n)?'editable':''}`} onFocus={()=>setSelected(n.id)} style={{zIndex:selected===n.id?4:undefined,left:position?.id===n.id?position.x:n.x,top:position?.id===n.id?position.y:n.y}} onPointerDown={e=>down(e,n)} onDoubleClick={()=>open(n)} aria-label={`노트: ${n.text}`}>
     <div className="mr-note-top"><span aria-hidden>⠿</span><Tooltip title={canEdit(n)?'노트 편집':'작성자·호스트·발표자만 편집 가능'}><span><IconButton aria-label={`노트 편집: ${n.text}`} disabled={!canEdit(n)||saving} onClick={()=>open(n)}><SquarePen size={16}/></IconButton></span></Tooltip></div>
     <p>{n.text}</p><footer><span>{n.author}</span><span>#{n.revision}</span></footer>
    </article>)}
    {showCursors&&peers.filter(p=>p.userId!==userId).map(p=><div className="mr-peer" key={p.userId} style={{left:p.x,top:p.y}}><MousePointer2 size={20} fill="currentColor"/><span>{p.name}</span></div>)}
   </div></div>
  </div>
  <div className="mr-board-tools"><Tooltip title="노트를 끌어 이동"><IconButton aria-label="선택 도구" className="selected"><MousePointer2 size={19}/></IconButton></Tooltip><span className="mr-tool-line"/><Button onClick={add} disabled={board.version<0||saving} startIcon={<StickyNote size={18}/>} className="mr-add-note">노트 추가</Button></div>
  <div className="mr-zoom"><IconButton aria-label="축소" disabled={zoom<=.5} onClick={()=>setZoom(z=>Math.max(.5,z-.1))}><Minus size={16}/></IconButton><span>{Math.round(zoom*100)}%</span><IconButton aria-label="확대" disabled={zoom>=1.5} onClick={()=>setZoom(z=>Math.min(1.5,z+.1))}><Plus size={16}/></IconButton><Tooltip title="화면에 맞추기"><IconButton aria-label="화면에 맞추기" onClick={()=>setZoom(Math.max(.3,Math.min(1,(stage.current?.clientWidth??800)/1280)))}><Maximize2 size={16}/></IconButton></Tooltip></div>
  <Dialog open={!!edit} onClose={saving?undefined:()=>setEdit(null)} fullWidth maxWidth="xs"><DialogTitle><span>{edit?.revision?'노트 편집':'새 아이디어'}</span><IconButton aria-label="편집 닫기" disabled={saving} onClick={()=>setEdit(null)} sx={{float:'right'}}><X size={18}/></IconButton></DialogTitle><DialogContent>
   {conflict&&<Alert severity="warning" sx={{mb:2}}>다른 참가자가 이 노트를 변경했습니다. 닫고 최신 노트를 다시 열어주세요.</Alert>}
   {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
   <TextField autoFocus label="아이디어 내용" multiline minRows={4} fullWidth value={text} onChange={e=>setText(e.target.value)} slotProps={{htmlInput:{maxLength:2000}}}/>
   <div className="mr-colors" role="group" aria-label="노트 색상">{colors.map((c,i)=><button key={c} className={`${c} ${color===c?'chosen':''}`} aria-label={['노란색','보라색','초록색','분홍색'][i]} aria-pressed={color===c} onClick={()=>setColor(c)}/>)}</div>
  </DialogContent><DialogActions>{!!edit?.revision&&<Button color="error" disabled={saving||conflict} startIcon={<Trash2 size={16}/>} onClick={()=>{if(edit)void save(edit.id,null,edit.revision).then(ok=>{if(ok)setEdit(null);});}}>삭제</Button>}<Button onClick={()=>setEdit(null)} disabled={saving}>취소</Button><Button variant="contained" onClick={()=>void commit()} disabled={saving||!text.trim()||conflict}>{saving?'저장 중…':'보드에 저장'}</Button></DialogActions></Dialog>
 </section>;
}
