import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=spawn('node',['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'ignore'});
let browser;const checks=[],sockets=[];
let chatLog=Array.from({length:65},(_,i)=>({id:String(i+1),roomId:7,sender:'상현',senderId:'1',message:`지난 대화 ${i+1}`,type:'TEXT',createdAt:new Date(Date.UTC(2026,8,26,12,0,i)).toISOString(),clientMessageId:null}));
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
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage',...JSON.parse(process.env.CHROMIUM_EXTRA_ARGS||'[]')]});
 async function open(userId,width){
  const ctx=await browser.newContext({viewport:{width,height:1000},hasTouch:width<760,isMobile:width<760}),p=await ctx.newPage(),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));const person=people.find(x=>x.userId===userId);
  await p.route(/^http:\/\/127\.0\.0\.1:5173\/api\//,async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;let data={},status=200;
   if(path.endsWith('/ws-stomp/info'))data={websocket:true,cookie_needed:false,origins:['*:*'],entropy:123};
   else if(path.endsWith('/auth/login')||path.endsWith('/auth/refresh'))data={accessToken:`test-${userId}`};
   else if(path.endsWith('/auth/me'))data={id:userId,email:`u${userId}@example.com`,username:person.username,role:'USER'};
   else if(path==='/api/room')data=[{id:7,title:'우리의 다음 아이디어',visibility:'PUBLIC'}];
   else if(path.endsWith('/members'))data=people;
   else if(path==='/api/room/7')data={id:7,title:'우리의 다음 아이디어',visibility:'PUBLIC'};
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
   else if(f.startsWith('SEND')){const dest=f.match(/\ndestination:([^\n]+)/)[1],body=JSON.parse(f.split('\n\n')[1].replace(/\0$/,''));if(dest.includes('/cursor/'))broadcast('/sub/cursor/room/7',{...body,userId,name:person.username});else{const m={...body,id:String(BigInt(chatLog.at(-1)?.id||'0')+1n),sender:person.username,senderId:String(userId),createdAt:new Date().toISOString()};chatLog.push({...m,clientMessageId:null});if(body.message!=='확인 대기 테스트'){broadcast('/sub/chat/room/7',m);broadcast('/sub/chat/room/7',m);}}}
   else if(f.startsWith('DISCONNECT')){s.subs.clear();const r=f.match(/\nreceipt:([^\n]+)/)?.[1];if(r)ws.send('a'+JSON.stringify([`RECEIPT\nreceipt-id:${r}\n\n\0`]));}
  }});});
  await p.goto('http://127.0.0.1:5173/login');await p.getByLabel('이메일',{exact:true}).fill(`u${userId}@example.com`);await p.getByLabel('비밀번호',{exact:true}).fill('Password123!');await p.getByRole('button',{name:'로그인',exact:true}).click();await p.getByRole('heading',{name:'내 회의실'}).waitFor();await p.getByRole('button',{name:'회의실 열기'}).click();await p.locator('.mr-chat-status').getByText('실시간 연결됨').waitFor({state:'attached'});await p.locator('.mr-sticky').first().waitFor();return {p,ctx,errors};
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
 await host.p.getByRole('button',{name:'마이크 테스트'}).click();await host.p.getByText('음성 통화는 아직 연결되지 않았어요.',{exact:false}).waitFor();await host.p.getByRole('button',{name:'닫기',exact:true}).click();check(true,'음성 미구현 안내');
 await host.p.getByRole('button',{name:'이전 대화 불러오기',exact:true}).click();await host.p.getByRole('log').getByText('지난 대화 1',{exact:true}).waitFor();check(true,'이전 대화 커서 페이지 조회');
 check(await host.p.locator('[data-message-id]').count()===chatLog.length,'실시간 중복 수신과 기록 중복 제거');
 await mobileTab('채팅');await member.p.getByRole('log').getByText('모바일에서도 함께해요',{exact:true}).waitFor();check(true,'새로고침 후 채팅 복원');
 const activeSocket=[...sockets].reverse().find(x=>x.userId===2&&x.subs.size);activeSocket.subs.clear();activeSocket.ws.close({code:1000,reason:'reconnect test'});
 for(let i=0;i<70;i++){chatLog.push({id:String(BigInt(chatLog.at(-1).id)+1n),roomId:7,sender:'상현',senderId:'1',message:`오프라인 중 대화 ${i+1}`,type:'TEXT',createdAt:new Date().toISOString(),clientMessageId:null});}
 await member.p.getByRole('button',{name:'재시도',exact:true}).click();await member.p.getByRole('log').getByText('오프라인 중 대화 70',{exact:true}).waitFor();check(await member.p.getByRole('log').getByText('오프라인 중 대화 1',{exact:true}).count()===1,'재접속 후 50개를 넘는 누락 메시지 복구');
 await member.p.getByLabel('채팅 메시지').fill('확인 대기 테스트');await member.p.getByRole('button',{name:'메시지 전송'}).click();check(await member.p.getByRole('button',{name:'메시지 전송'}).isDisabled(),'저장 확인 전 중복 전송 차단');
 await member.p.getByText('저장 확인 응답을 받지 못했습니다.',{exact:false}).waitFor({timeout:15000});check(await member.p.getByLabel('채팅 메시지').inputValue()==='확인 대기 테스트','확인 응답 유실 시 입력 유지 및 안내');
 await member.p.getByRole('log').getByText('확인 대기 테스트',{exact:true}).waitFor();check(await member.p.getByRole('log').getByText('확인 대기 테스트',{exact:true}).count()===1,'확인 응답 유실 후 저장 기록 재조회');
 mkdirSync('tests/evidence',{recursive:true});
 for(const [client,width] of [[host,1440],[member,390],[presenter,360]]){
  check(!await client.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${width}px 가로 넘침 없음`);check(client.errors.length===0,`${width}px 페이지 오류 없음`);
  if(process.env.TEST_KOREAN_FONT){await client.p.addStyleTag({content:`@font-face{font-family:TestKorean;src:url(data:font/otf;base64,${readFileSync(process.env.TEST_KOREAN_FONT).toString('base64')})}body,*{font-family:TestKorean,sans-serif!important}`});await client.p.evaluate(()=>document.fonts.ready);}
  await client.p.screenshot({path:`tests/evidence/room-design-${width}.png`,fullPage:true});
 }
 writeFileSync('tests/evidence/board-browser-results.json',JSON.stringify({backend:'mock REST and SockJS/STOMP; not live PostgreSQL',checks},null,2));console.log(JSON.stringify(checks));
}finally{await browser?.close();server.kill();}
