import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=spawn('node',['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'ignore'});
let browser;const checks=[],sockets=[];
let chatLog=Array.from({length:65},(_,i)=>({id:String(i+1),roomId:7,sender:'상현',senderId:'1',message:`지난 대화 ${i+1}`,type:'TEXT',createdAt:new Date(Date.UTC(2026,8,26,12,0,i)).toISOString(),clientMessageId:null}));
let meeting={note:{content:'',version:0,author:null},tasks:[],polls:[],bookmarks:[]},roomControls={locked:false,ended:false},invites=[];
let state={schema:'mingleroom-sticky-v1',version:4,notes:[
 {id:'n1',text:'회의에 들어오면\n바로 시작할 수 있게',color:'yellow',x:100,y:170,authorId:1,author:'상현',revision:1},
 {id:'n2',text:'말로 다 못한 생각은\n스티키 노트에 남겨요.',color:'purple',x:420,y:160,authorId:2,author:'지민',revision:2},
 {id:'n3',text:'좋은 아이디어는\n함께 발전시켜요.',color:'green',x:790,y:200,authorId:3,author:'서연',revision:3},
 {id:'n4',text:'오늘의 목표\n함께 쓰고, 함께 결정하기',color:'pink',x:380,y:440,authorId:1,author:'상현',revision:4}]};
const people=[{userId:1,username:'상현',roleInRoom:'HOST'},{userId:2,username:'지민',roleInRoom:'MEMBER'},{userId:3,username:'서연',roleInRoom:'PRESENTER'}];
const broadcast=(topic,body)=>{for(const s of sockets){const id=s.subs.get(topic);if(id)try{s.ws.send('a'+JSON.stringify([`MESSAGE\nsubscription:${id}\nmessage-id:${crypto.randomUUID()}\ndestination:${topic}\n\n${JSON.stringify(body)}\0`]));}catch{}}};
const check=(v,label)=>{if(!v)throw Error(label);checks.push(label);};
try{
 for(let i=0;i<60;i++){try{await fetch('http://127.0.0.1:5173');break;}catch{await new Promise(r=>setTimeout(r,200));}}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--allow-loopback-in-peer-connection','--disable-features=WebRtcHideLocalIpsWithMdns','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required','--no-sandbox','--disable-dev-shm-usage',...JSON.parse(process.env.CHROMIUM_EXTRA_ARGS||'[]')]});
 async function open(userId,width){
  const ctx=await browser.newContext({permissions:['microphone'],viewport:{width,height:1000},hasTouch:width<760,isMobile:width<760}),p=await ctx.newPage(),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));const person=people.find(x=>x.userId===userId);
  await p.route(/^http:\/\/127\.0\.0\.1:5173\/api\//,async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;let data={},status=200;
   if(path.endsWith('/ws-stomp/info'))data={websocket:true,cookie_needed:false,origins:['*:*'],entropy:123};
   else if(path.endsWith('/auth/login')||path.endsWith('/auth/refresh'))data={accessToken:`test-${userId}`};
   else if(path.endsWith('/auth/me'))data={id:userId,email:`u${userId}@example.com`,username:person.username,role:'USER'};
   else if(path==='/api/room')data=[{id:7,title:'우리의 다음 아이디어',visibility:'PUBLIC'}];
   else if(path.endsWith('/members'))data=people;
   else if(path==='/api/room/7')data={id:7,title:'우리의 다음 아이디어',visibility:'PUBLIC'};
   else if(path==='/api/room/7/meeting')data=meeting;
   else if(path==='/api/room/7/meeting/note'){const b=req.postDataJSON();if(b.version!==meeting.note.version){status=409;data={message:'회의록이 변경됐습니다. 내 초안을 복사하고 최신 내용을 불러오세요.'};}else{meeting.note={...b,version:b.version+1,author:person.username};data=meeting.note;}}
   else if(path.includes('/meeting/tasks')){const b=req.postDataJSON();if(userId===2){status=403;data={message:'호스트 또는 발표자만 사용할 수 있습니다.'};}else if(req.method()==='POST'){meeting.tasks.unshift({...b,id:Date.now(),revision:1});}else{const id=Number(path.split('/').pop()),old=meeting.tasks.find(t=>t.id===id);if(req.method()==='DELETE')meeting.tasks=meeting.tasks.filter(t=>t.id!==id);else{Object.assign(old,b,{revision:old.revision+1});}}}
   else if(path.includes('/meeting/polls')){const b=req.postDataJSON();if(path.endsWith('/vote')){const poll=meeting.polls.find(p=>p.id===Number(path.split('/').at(-2)));if(poll.closed){status=409;data={message:'마감된 투표입니다.'};}else{if(poll.myVote)poll.options.find(o=>o.id===poll.myVote).count--;poll.myVote=b.optionId;poll.options.find(o=>o.id===b.optionId).count++;}}else if(path.endsWith('/close'))meeting.polls.find(p=>p.id===Number(path.split('/').at(-2))).closed=true;else meeting.polls.unshift({id:Date.now(),question:b.question,closed:false,myVote:null,options:b.options.map((label,i)=>({id:i+1,label,count:0}))});}
   else if(path.includes('/meeting/bookmarks')){if(req.method()==='POST')meeting.bookmarks.unshift({...req.postDataJSON(),atMs:60000,id:Date.now(),authorId:userId,author:person.username});else meeting.bookmarks=meeting.bookmarks.filter(b=>b.id!==Number(path.split('/').pop()));}
   else if(path==='/api/room/7/controls')data=roomControls;
   else if(path.endsWith('/controls/lock'))roomControls.locked=req.postDataJSON().value;
   else if(path.endsWith('/controls/hand'))person.handRaised=req.postDataJSON().value;
   else if(path.endsWith('/controls/invites')){if(req.method()==='GET')data=invites;else{const b=req.postDataJSON(),i={id:Date.now(),maxUses:b.maxUses,usedCount:0,revoked:false,expiresAt:new Date(Date.now()+b.hours*3600000).toISOString()};invites.unshift(i);data={...i,token:'test-invite'};}}
   else if(path.includes('/controls/invites/'))invites.find(i=>i.id===Number(path.split('/').pop())).revoked=true;
   else if(path.includes('/controls/members/')){const parts=path.split('/'),person=people.find(p=>p.userId===Number(parts.at(-2)));if(path.endsWith('/role'))person.roleInRoom=req.postDataJSON().role;if(path.endsWith('/mute'))person.mute=req.postDataJSON().value;}
   else if(path.endsWith('/messages/search')){const q=new URL(req.url()).searchParams;const rows=chatLog.filter(m=>m.message.includes(q.get('q'))&&(!q.get('before')||BigInt(m.id)<BigInt(q.get('before')))).reverse();const page=rows.slice(0,50);data={items:page,hasMore:rows.length>50,nextCursor:rows.length>50?page.at(-1).id:null};}
   else if(path.endsWith('/messages')){
    const q=new URL(req.url()).searchParams,before=q.get('before'),after=q.get('after'),limit=Number(q.get('limit')||50);
    const rows=chatLog.filter(m=>(!before||BigInt(m.id)<BigInt(before))&&(!after||BigInt(m.id)>BigInt(after))).sort((a,b)=>after?Number(BigInt(a.id)-BigInt(b.id)):Number(BigInt(b.id)-BigInt(a.id)));
    const page=rows.slice(0,limit);data={items:after?page:[...page].reverse(),hasMore:rows.length>limit,nextCursor:rows.length>limit?page.at(-1).id:null};
   }
   else if(path.endsWith('/board'))data=state;
   else if(path.includes('/board/notes/')){
    const id=path.split('/').pop(),old=state.notes.find(n=>n.id===id),body=req.method()==='PUT'?req.postDataJSON():null,revision=body?.revision??Number(new URL(req.url()).searchParams.get('revision'));
    if(old&&userId===2&&old.authorId!==2){status=403;data={message:'본인 노트만 편집할 수 있습니다.'};}
    else if(revision!==(old?.revision??0)){status=409;data={message:'다른 참가자가 수정했습니다.'};}
    else{const version=state.version+1;state={...state,version,notes:state.notes.filter(n=>n.id!==id)};if(body)state.notes.push({...body,id,authorId:old?.authorId??userId,author:old?.author??person.username,revision:version});data=state;broadcast('/sub/board/room/7',state);}
   }else if(path.endsWith('/join/me'))data={};else{status=404;data={message:path};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  await p.routeWebSocket(/\/ws-stomp\/.*\/websocket/,ws=>{const s={ws,subs:new Map(),userId};sockets.push(s);ws.send('o');ws.onMessage(raw=>{for(const f of JSON.parse(String(raw))){
   if(f.startsWith('CONNECT'))ws.send('a'+JSON.stringify(['CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0']));
   else if(f.startsWith('SUBSCRIBE'))s.subs.set(f.match(/\ndestination:([^\n]+)/)[1],f.match(/\nid:([^\n]+)/)[1]);
   else if(f.startsWith('SEND')){const dest=f.match(/\ndestination:([^\n]+)/)[1],body=JSON.parse(f.split('\n\n')[1].replace(/\0$/,''));if(dest.includes('/signal/')){if(process.env.DEBUG_VOICE)console.log('signal',userId,body.type,body.target);broadcast('/sub/signal/room/7'+(body.target?`/user/${body.target}`:''),{...body,sender:userId});}else if(dest.includes('/cursor/'))broadcast('/sub/cursor/room/7',{...body,userId,name:person.username});else{const m={...body,id:String(BigInt(chatLog.at(-1)?.id||'0')+1n),sender:person.username,senderId:String(userId),createdAt:new Date().toISOString()};chatLog.push({...m,clientMessageId:null});if(body.message!=='확인 대기 테스트'){broadcast('/sub/chat/room/7',m);broadcast('/sub/chat/room/7',m);}}}
   else if(f.startsWith('DISCONNECT')){s.subs.clear();const r=f.match(/\nreceipt:([^\n]+)/)?.[1];if(r)ws.send('a'+JSON.stringify([`RECEIPT\nreceipt-id:${r}\n\n\0`]));}
  }});});
  if(process.env.TEST_KOREAN_FONT){
   await p.route('**/__test_font.otf',route=>route.fulfill({path:process.env.TEST_KOREAN_FONT,contentType:'font/otf'}));
   await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const style=document.createElement('style');style.textContent='@font-face{font-family:TestKorean;src:url(/__test_font.otf)}body,*{font-family:TestKorean,sans-serif!important}';document.head.append(style);}));
  }
  await p.goto('http://127.0.0.1:5173/login');if(process.env.TEST_KOREAN_FONT)await p.evaluate(()=>document.fonts.load('16px TestKorean'));
await p.getByLabel('이메일',{exact:true}).fill(`u${userId}@example.com`);await p.getByLabel('비밀번호',{exact:true}).fill('Password123!');await p.getByRole('button',{name:'로그인',exact:true}).click();await p.getByRole('heading',{name:'내 회의실'}).waitFor();await p.getByRole('button',{name:'회의실 열기'}).click();await p.locator('.mr-chat-status').getByText('실시간 연결됨').waitFor({state:'attached'});await p.locator('.mr-sticky').first().waitFor();return {p,ctx,errors};
 }
 const host=await open(1,1440),member=await open(2,390),presenter=await open(3,360);
 const add=async(p,text)=>{if(p.viewportSize().width<760)await p.getByRole('button',{name:'노트 추가',exact:true}).tap();else await p.getByRole('button',{name:'노트 추가',exact:true}).click();await p.getByLabel('아이디어 내용').fill(text);await p.getByRole('button',{name:'보드에 저장',exact:true}).click();};
 await add(host.p,'함께 작성한 새 아이디어');await member.p.locator('.mr-sticky').filter({hasText:'함께 작성한 새 아이디어'}).waitFor();check(true,'저장 후 다른 참가자에게 STOMP 반영');
 check(await member.p.getByRole('button',{name:'노트 편집: 함께 작성한 새 아이디어',exact:true}).isDisabled(),'MEMBER 타인 노트 편집 금지');
 await add(member.p,'내가 작성한 아이디어');await host.p.locator('.mr-sticky').filter({hasText:'내가 작성한 아이디어'}).waitFor();check(true,'모바일 MEMBER 노트 생성');
 // Move a non-overlapping original note using pointer capture.
 const note=host.p.locator('.mr-sticky').filter({hasText:'회의에 들어오면'}),box=await note.boundingBox(),old=state.notes.find(n=>n.id==='n1').x;
 await host.p.mouse.move(box.x+30,box.y+12);await host.p.mouse.down();await host.p.mouse.move(box.x+550,box.y+312,{steps:8});await host.p.mouse.up();await new Promise(r=>setTimeout(r,250));check(state.notes.find(n=>n.id==='n1').x>old,'드래그 좌표 서버 저장');
 await presenter.p.getByRole('button',{name:'노트 편집: 함께 작성한 새 아이디어',exact:true}).click();await presenter.p.getByLabel('아이디어 내용').fill('발표자가 정리한 아이디어');await presenter.p.getByRole('button',{name:'보드에 저장',exact:true}).click();await host.p.locator('.mr-sticky').filter({hasText:'발표자가 정리한 아이디어'}).waitFor();check(true,'PRESENTER 타인 노트 편집');
 await host.p.getByRole('button',{name:'노트 편집: 발표자가 정리한 아이디어',exact:true}).click();const n=state.notes.find(n=>n.text==='발표자가 정리한 아이디어');state={...state,version:state.version+1,notes:state.notes.map(x=>x.id===n.id?{...x,text:'다른 참가자의 최신 수정',revision:state.version+1}:x)};broadcast('/sub/board/room/7',state);await host.p.getByText('다른 참가자가 이 노트를 변경했습니다.',{exact:false}).waitFor();check(await host.p.getByRole('button',{name:'보드에 저장',exact:true}).isDisabled(),'동시 수정 덮어쓰기 방지');await host.p.getByRole('button',{name:'편집 닫기'}).click();
 const mobileTab=async(name)=>member.p.getByRole('navigation',{name:'회의실 화면 전환'}).getByRole('button',{name,exact:true}).click();
 await mobileTab('채팅');await member.p.getByLabel('채팅 메시지').fill('모바일에서도 함께해요');await member.p.getByRole('button',{name:'메시지 전송'}).click();await host.p.getByRole('log').getByText('모바일에서도 함께해요').waitFor();check(true,'모바일 채팅 송수신');
 await mobileTab('참가자');await member.p.getByText('지민 (나)').waitFor();check(true,'모바일 참가자 패널');await mobileTab('보드');await member.p.reload();await member.p.locator('.mr-sticky').filter({hasText:'내가 작성한 아이디어'}).waitFor();check(true,'새로고침 후 보드 복원');
 await member.p.getByRole('button',{name:'노트 편집: 내가 작성한 아이디어',exact:true}).tap();await member.p.getByRole('button',{name:'삭제',exact:true}).tap();await host.p.locator('.mr-sticky').filter({hasText:'내가 작성한 아이디어'}).waitFor({state:'detached'});check(true,'모바일 터치로 본인 노트 삭제 및 동기화');
 await host.p.mouse.move(220,420);await member.p.locator('.mr-peer').filter({hasText:'상현'}).waitFor();check(true,'실제 사용자 커서 이벤트 수신');

 await host.p.getByRole('button',{name:'보드 집중 보기'}).click();check(!await host.p.locator('.mr-conversation').isVisible(),'보드 집중 보기');await host.p.getByRole('button',{name:'보드 집중 보기'}).click();
 await host.p.getByRole('button',{name:'초대 링크'}).click();await host.p.getByText('http://127.0.0.1:5173/lobby/7',{exact:true}).waitFor();await host.p.getByRole('button',{name:'닫기',exact:true}).click();check(true,'실제 입장 링크');
 await host.p.getByRole('button',{name:'음성 참여',exact:true}).click();await host.p.getByRole('button',{name:'음성 참여 시작',exact:true}).click();await host.p.getByText('음성 회의에 참여하고 있어요',{exact:true}).waitFor();await host.p.getByRole('button',{name:'닫기',exact:true}).click();
 await member.p.getByRole('button',{name:'음성 참여',exact:true}).click();await member.p.getByRole('button',{name:'음성 참여 시작',exact:true}).click();await member.p.getByText('상현 · 연결됨',{exact:true}).waitFor({timeout:20000}).catch(async e=>{console.log('VOICE MEMBER',await member.p.locator('body').innerText());console.log('VOICE HOST',await host.p.locator('body').innerText());throw e;});check(true,'실제 RTCPeerConnection 2인 음성 연결 (가상 마이크)');await member.p.getByRole('button',{name:'닫기',exact:true}).click();
 await host.p.getByRole('button',{name:'마이크 끄기',exact:true}).click();await host.p.getByRole('button',{name:'마이크 켜기',exact:true}).waitFor();check(true,'연결 중 마이크 음소거');
 await member.p.getByRole('button',{name:'음성 상태',exact:true}).click();await member.p.getByRole('button',{name:'음성 나가기',exact:true}).click();await member.p.getByRole('button',{name:'닫기',exact:true}).click();await host.p.getByText('음성 참여 중 · 연결 0명',{exact:true}).waitFor();check(true,'음성 나가기 피어 정리');
 await host.p.getByRole('button',{name:'음성 상태',exact:true}).click();await host.p.getByRole('button',{name:'음성 나가기',exact:true}).click();await host.p.getByRole('button',{name:'닫기',exact:true}).click();
 await host.p.getByRole('button',{name:'이전 대화 불러오기',exact:true}).click();await host.p.getByRole('log').getByText('지난 대화 1',{exact:true}).waitFor();check(true,'이전 대화 커서 페이지 조회');
 check(await host.p.locator('[data-message-id]').count()===chatLog.length,'실시간 중복 수신과 기록 중복 제거');
 await mobileTab('채팅');await member.p.getByRole('log').getByText('모바일에서도 함께해요',{exact:true}).waitFor();check(true,'새로고침 후 채팅 복원');
 const activeSocket=[...sockets].reverse().find(x=>x.userId===2&&x.subs.size);activeSocket.subs.clear();activeSocket.ws.close({code:1000,reason:'reconnect test'});
 for(let i=0;i<70;i++){chatLog.push({id:String(BigInt(chatLog.at(-1).id)+1n),roomId:7,sender:'상현',senderId:'1',message:`오프라인 중 대화 ${i+1}`,type:'TEXT',createdAt:new Date().toISOString(),clientMessageId:null});}
 await member.p.getByRole('button',{name:'재시도',exact:true}).click();await member.p.getByRole('log').getByText('오프라인 중 대화 70',{exact:true}).waitFor();check(await member.p.getByRole('log').getByText('오프라인 중 대화 1',{exact:true}).count()===1,'재접속 후 50개를 넘는 누락 메시지 복구');
 await member.p.getByLabel('채팅 메시지').fill('확인 대기 테스트');await member.p.getByRole('button',{name:'메시지 전송'}).click();check(await member.p.getByRole('button',{name:'메시지 전송'}).isDisabled(),'저장 확인 전 중복 전송 차단');
 await member.p.getByText('저장 확인 응답을 받지 못했습니다.',{exact:false}).waitFor({timeout:15000});check(await member.p.getByLabel('채팅 메시지').inputValue()==='확인 대기 테스트','확인 응답 유실 시 입력 유지 및 안내');
 await member.p.getByRole('log').getByText('확인 대기 테스트',{exact:true}).waitFor();check(await member.p.getByRole('log').getByText('확인 대기 테스트',{exact:true}).count()===1,'확인 응답 유실 후 저장 기록 재조회');
 // Meeting tools, conflict recovery, mobile voting and host controls.
 host.p.on('dialog',d=>d.accept());member.p.on('dialog',d=>d.accept());
 await host.p.getByRole('button',{name:'회의 도구',exact:true}).click();await host.p.getByLabel('공유 회의록',{exact:true}).fill('오늘 결정: 공동 회의 도구 구현');await host.p.getByRole('button',{name:'회의록 저장',exact:true}).click();await host.p.getByText('회의록을 저장했어요.',{exact:true}).waitFor();check(meeting.note.version===1,'공유 회의록 저장');
 await member.p.getByRole('button',{name:'회의 도구',exact:true}).click();await member.p.getByLabel('공유 회의록',{exact:true}).waitFor();check(await member.p.getByLabel('공유 회의록',{exact:true}).inputValue()===meeting.note.content,'모바일 회의록 복원');
 await member.p.getByLabel('공유 회의록',{exact:true}).fill('모바일 미저장 초안');await host.p.getByLabel('공유 회의록',{exact:true}).fill('호스트의 최신 결정');await host.p.getByRole('button',{name:'회의록 저장',exact:true}).click();await member.p.getByText('다른 참가자가 수정했어요.',{exact:false}).waitFor();check(await member.p.getByLabel('공유 회의록',{exact:true}).inputValue()==='모바일 미저장 초안','원격 회의록 수정 시 미저장 초안 보존');await member.p.getByRole('button',{name:'회의록 저장',exact:true}).click();await member.p.getByText('회의록이 변경됐습니다.',{exact:false}).waitFor();check(meeting.note.content==='호스트의 최신 결정','회의록 충돌 409 덮어쓰기 차단');await member.p.getByRole('button',{name:'최신 내용으로 교체',exact:true}).click();
 await host.p.getByRole('tab',{name:'할 일',exact:true}).click();await host.p.getByLabel('할 일 제목',{exact:false}).fill('모바일 검증');await host.p.getByRole('button',{name:'할 일 추가',exact:true}).click();await host.p.getByText('모바일 검증',{exact:true}).waitFor();check(meeting.tasks.length===1,'할 일 생성');await host.p.getByRole('button',{name:'수정',exact:true}).click();await host.p.getByLabel('상태',{exact:true}).click();await host.p.getByRole('option',{name:'완료',exact:true}).click();await host.p.getByRole('button',{name:'할 일 수정 저장',exact:true}).click();await host.p.getByText('완료',{exact:true}).last().waitFor();check(meeting.tasks[0].status==='DONE','할 일 상태 변경');
 await member.p.getByRole('tab',{name:'할 일',exact:true}).click();await member.p.getByText('호스트와 발표자가 할 일을 관리합니다.',{exact:true}).waitFor();check(await member.p.getByRole('button',{name:'할 일 추가',exact:true}).count()===0,'MEMBER 할 일 관리 숨김');
 await host.p.getByRole('tab',{name:'투표',exact:true}).click();await host.p.getByLabel('투표 질문',{exact:false}).fill('다음 회의 시간');await host.p.getByRole('button',{name:'투표 만들기',exact:true}).click();await host.p.getByText('다음 회의 시간',{exact:true}).waitFor();await member.p.getByRole('tab',{name:'투표',exact:true}).click();await member.p.getByRole('button',{name:'찬성 · 0표',exact:false}).click();await member.p.getByRole('button',{name:'찬성 · 1표',exact:false}).waitFor();check(meeting.polls[0].options[0].count===1,'모바일 투표');await member.p.getByRole('button',{name:'반대 · 0표',exact:false}).click();await member.p.getByRole('button',{name:'반대 · 1표',exact:false}).waitFor();check(meeting.polls[0].options[0].count===0,'투표 변경 시 한 표 유지');await host.p.getByRole('button',{name:'투표 마감',exact:true}).click();await member.p.getByText('다음 회의 시간 · 마감',{exact:true}).waitFor();check(await member.p.getByRole('button',{name:'반대 · 1표',exact:false}).isDisabled(),'마감 투표 수정 차단');
 await host.p.getByRole('tab',{name:'북마크',exact:true}).click();await host.p.getByLabel('북마크 메모',{exact:true}).fill('주요 결정');await host.p.getByRole('button',{name:'기록',exact:true}).click();await host.p.getByText('주요 결정',{exact:false}).waitFor();check(meeting.bookmarks.length===1,'타임스탬프 북마크');
 await host.p.getByRole('tab',{name:'대화 검색',exact:true}).click();await host.p.getByLabel('대화 검색어',{exact:true}).fill('오프라인 중 대화');await host.p.getByRole('button',{name:'검색',exact:true}).click();await host.p.getByRole('dialog').getByText('오프라인 중 대화 70',{exact:true}).waitFor();await host.p.getByRole('button',{name:'검색 결과 더 보기',exact:true}).click();await host.p.getByRole('dialog').getByText('오프라인 중 대화 1',{exact:true}).waitFor();check(true,'전체 대화 검색과 검색 결과 페이지 조회');
 mkdirSync('tests/evidence',{recursive:true});
 await member.p.getByRole('tab',{name:'회의록',exact:true}).click();await member.p.screenshot({path:'tests/evidence/meeting-tools-mobile.png',fullPage:true});
 for(const client of [host,member]){check(!await client.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'회의 도구 가로 넘침 없음');await client.p.getByRole('button',{name:'닫기',exact:true}).click();}
 await member.p.getByRole('button',{name:'손들기',exact:true}).click();await member.p.getByRole('button',{name:'손 내리기',exact:true}).waitFor();check(people[1].handRaised,'손들기 저장');
 await host.p.getByRole('button',{name:'호스트 관리',exact:true}).click();await host.p.getByRole('button',{name:'새 참가자 입장 잠금',exact:true}).click();await host.p.getByRole('button',{name:'입장 잠금 해제',exact:true}).waitFor();check(roomControls.locked,'호스트 입장 잠금');await host.p.getByRole('button',{name:'입장 잠금 해제',exact:true}).click();await host.p.getByRole('button',{name:'제한 초대 링크 만들기',exact:true}).click();await host.p.getByLabel('생성된 초대 링크 (지금 복사해 두세요)',{exact:true}).waitFor();check(invites.length===1,'제한 초대 발급');await host.p.getByRole('button',{name:'폐기',exact:true}).click();await host.p.getByRole('button',{name:'폐기',exact:true}).isDisabled();check(invites[0].revoked,'초대 폐기');await host.p.getByRole('button',{name:'닫기',exact:true}).click();
 const download=host.p.waitForEvent('download');await host.p.getByRole('button',{name:'보드 PNG 내보내기',exact:true}).click();check((await download).suggestedFilename()==='mingleroom-board.png','보드 PNG 내보내기');
 mkdirSync('tests/evidence',{recursive:true});
 for(const [client,width] of [[host,1440],[member,390],[presenter,360]]){
  check(!await client.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${width}px 가로 넘침 없음`);check(client.errors.length===0,`${width}px 페이지 오류 없음`);
  await client.p.screenshot({path:`tests/evidence/room-design-${width}.png`,fullPage:true});
 }
 writeFileSync('tests/evidence/board-browser-results.json',JSON.stringify({backend:'mock REST/STOMP; real RTCPeerConnection with fake microphones; no live PostgreSQL',checks},null,2));console.log(JSON.stringify(checks));
}finally{await browser?.close();server.kill();}
