import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync,writeFileSync } from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin='http://127.0.0.1:5175';
const server=spawn('node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5175','--strictPort'],{stdio:'ignore'});
let browser;const checks=[],errors=[],requests=[];
const settingsRequests=[];
const members=new Set([1]),invites=new Map();let locked=false;
const room={id:7,title:'비공개 초대 회의',visibility:'PRIVATE'};
const check=(v,label)=>{if(!v)throw new Error(label);checks.push(label);};
try{
 for(let i=0;i<60;i++){try{await fetch(origin);break;}catch{await new Promise(r=>setTimeout(r,200));}}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 async function client(id,width=390){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
  const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));let authenticated=false;
  await page.route(`${origin}/api/**`,async route=>{
   const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method();let data={},status=200;
   if(path.endsWith('/auth/login')){authenticated=true;data={accessToken:`test-${id}`};}
   else if(path.endsWith('/auth/join'))data={};
   else if(path.endsWith('/auth/refresh')){if(authenticated)data={accessToken:`test-${id}`};else status=401;}
   else if(path.endsWith('/auth/me'))data={id,email:`guest${id}@example.test`,username:id===1?'호스트':`참가자${id}`,role:'USER'};
   else if(path.endsWith('/ws-stomp/info'))data={websocket:true,cookie_needed:false,origins:['*:*'],entropy:1};
   else if(!authenticated){status=401;data={message:'로그인이 필요합니다.'};}
   else if(path==='/api/room/create'){const body=req.postDataJSON();Object.assign(room,{title:body.title,visibility:body.visibility});data=room;settingsRequests.push({kind:'create',body});}
   else if(path==='/api/room')data=members.has(id)?[room]:[];
   else if(path==='/api/room/7/controls/redeem'){
    const token=req.postDataJSON().token;requests.push({id,token,kind:'redeem'});const invite=invites.get(token);
    if(members.has(id))data={};
    else if(locked){status=403;data={message:'호스트가 새 참가자 입장을 잠갔습니다. 호스트에게 입장 잠금 해제를 요청하세요.'};}
    else if(!invite){status=403;data={message:'이 회의실의 유효한 초대 링크가 아닙니다.'};}
    else if(invite.revoked){status=403;data={message:'호스트가 폐기한 초대 링크입니다. 새 초대를 요청하세요.'};}
    else if(invite.expired){status=403;data={message:'초대 링크의 유효 시간이 지났습니다. 새 초대를 요청하세요.'};}
    else if(invite.used>=invite.maxUses){status=403;data={message:'초대 링크의 입장 가능 인원을 모두 사용했습니다. 새 초대를 요청하세요.'};}
    else{invite.used++;members.add(id);}
   }
   else if(path.endsWith('/join/me')){requests.push({id,kind:'public'});if(!members.has(id)){if(room.visibility==='PUBLIC'&&!locked)members.add(id);else{status=403;data={message:'이 회의실은 유효한 초대 링크가 필요합니다.'};}}}
   else if(!members.has(id)){status=403;data={message:'방 참가자만 조회할 수 있습니다.'};}
   else if(path==='/api/room/7'){
    if(method==='PATCH'){const body=req.postDataJSON();settingsRequests.push({kind:'patch',body});if(id!==1){status=403;data={message:'호스트만 방 설정을 변경할 수 있습니다.'};}else if(body.expectedTitle!==room.title||body.expectedVisibility!==room.visibility){status=409;data={message:'다른 화면에서 방 설정을 수정했습니다. 최신 설정을 불러온 뒤 다시 저장하세요.'};}else{Object.assign(room,{title:body.title,visibility:body.visibility});data=room;}}
    else data=room;
   }
   else if(path.endsWith('/members'))data=[...members].map(userId=>({userId,username:userId===1?'호스트':`참가자${userId}`,roleInRoom:userId===1?'HOST':'MEMBER',mute:false,handRaised:false}));
   else if(path.endsWith('/board'))data={schema:'mingleroom-sticky-v1',version:0,notes:[]};
   else if(path.endsWith('/messages'))data={items:[],hasMore:false,nextCursor:null};
   else if(path.endsWith('/controls'))data={locked,ended:false};
   else if(path.endsWith('/controls/invites')){
    if(method==='GET')data=[];
    else{const b=req.postDataJSON(),token=crypto.randomUUID();invites.set(token,{...b,used:0,revoked:false,expired:false});data={id:invites.size,token,expiresAt:new Date(Date.now()+b.hours*3600000).toISOString()};}
   }
   else{status=404;data={message:path};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.routeWebSocket(/\/ws-stomp\/.*\/websocket/,ws=>{ws.send('o');ws.onMessage(raw=>{for(const frame of JSON.parse(String(raw))){if(frame.startsWith('CONNECT'))ws.send('a'+JSON.stringify(['CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0']));if(frame.startsWith('DISCONNECT')){const receipt=frame.match(/\nreceipt:([^\n]+)/)?.[1];if(receipt)ws.send('a'+JSON.stringify([`RECEIPT\nreceipt-id:${receipt}\n\n\0`]));}}});});
  const login=async()=>{await page.getByLabel('이메일',{exact:true}).fill(`guest${id}@example.test`);await page.getByLabel('비밀번호',{exact:true}).fill('Password123!');await page.getByRole('button',{name:'로그인',exact:true}).click();};
  return {page,context,login,id};
 }
 const host=await client(1,1440);await host.page.goto(`${origin}/login`);await host.login();await host.page.getByRole('button',{name:'새 회의실',exact:true}).click();await host.page.getByLabel('회의실 이름',{exact:true}).fill('비공개 초대 회의');await host.page.getByLabel('공개 범위',{exact:true}).click();await host.page.getByRole('option',{name:'비공개 · 제한 초대로 입장',exact:true}).click();await host.page.getByRole('button',{name:'생성하고 입장',exact:true}).click();
 check(settingsRequests[0]?.body.visibility==='PRIVATE','비공개 방 생성 선택과 API 전달');await host.page.getByRole('heading',{name:'비공개 초대 회의',exact:false}).waitFor();
 const issue=async()=>{await host.page.getByRole('button',{name:'초대 링크',exact:true}).click();check(await host.page.getByRole('button',{name:'일반 입장 링크 복사',exact:true}).count()===0,'비공개 방에 토큰 없는 복사 버튼 없음');const response=host.page.waitForResponse(r=>r.url().endsWith('/controls/invites')&&r.request().method()==='POST');await host.page.getByRole('button',{name:'제한 초대 링크 발급',exact:true}).click();const issued=await (await response).json();await host.page.waitForFunction(token=>[...document.querySelectorAll('textarea')].some(e=>e.value.includes(token)),issued.token);const value=await host.page.getByLabel('제한 초대 링크',{exact:true}).inputValue();await host.page.getByRole('button',{name:'닫기',exact:true}).click();return value;};
 const link=await issue(),token=new URL(link).searchParams.get('invite');check(!!token,'상단 초대 버튼에서 제한 토큰 발급');
 const guest=await client(2);await guest.page.goto(link);await guest.page.getByRole('button',{name:'로그인',exact:true}).waitFor();await guest.login();await guest.page.waitForURL(`**/lobby/7?invite=${token}`);await guest.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await guest.page.getByRole('heading',{name:'비공개 초대 회의',exact:false}).waitFor();check(members.has(2)&&invites.get(token).used===1,'미로그인 수신자 로그인 후 비공개 입장, 토큰 보존');
 check(!requests.some(r=>r.id===2&&r.kind==='public'),'제한 초대는 일반 join API를 호출하지 않음');
 await guest.page.goto(link);await guest.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await guest.page.getByRole('heading',{name:'비공개 초대 회의',exact:false}).waitFor();check(invites.get(token).used===1,'이미 입장한 멤버 재입장 시 사용 횟수 유지');
 const next=await issue(),newToken=new URL(next).searchParams.get('invite');
 const signup=await client(3,360);await signup.page.goto(next);await signup.page.getByRole('link',{name:'계정이 없어요 · 회원가입'}).click();await signup.page.getByLabel('이름',{exact:true}).fill('신규 참가자');await signup.page.getByLabel('이메일',{exact:true}).fill('guest3@example.test');await signup.page.getByLabel('비밀번호',{exact:true}).fill('Password123!');await signup.page.getByRole('button',{name:'회원가입',exact:true}).click();await signup.page.getByRole('button',{name:'로그인',exact:true}).waitFor();await signup.page.reload();await signup.login();await signup.page.waitForURL(`**/lobby/7?invite=${newToken}`);await signup.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await signup.page.getByRole('heading',{name:'비공개 초대 회의',exact:false}).waitFor();check(members.has(3),'회원가입→로그인 페이지 새로고침→비공개 입장 시 초대 유지');
 const pasted=await issue(),pastedToken=new URL(pasted).searchParams.get('invite'),paste=await client(4);await paste.page.goto(`${origin}/login`);await paste.login();await paste.page.getByLabel('회의실 번호 또는 초대 링크',{exact:true}).fill(pasted);await paste.page.getByRole('button',{name:'입장하기',exact:true}).click();await paste.page.waitForURL(`**/lobby/7?invite=${pastedToken}`);await paste.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await paste.page.getByRole('heading',{name:'비공개 초대 회의',exact:false}).waitFor();check(members.has(4),'대시보드 전체 링크 붙여넣기 후 입장');
 const denied=await client(5);await denied.page.goto(`${origin}/login`);await denied.login();
 for(const [query,expected] of [['','유효한 초대 링크가 필요합니다'],['?invite=','초대 링크가 올바르지 않습니다'],[`?invite=${token}`,'입장 가능 인원을 모두 사용']]){await denied.page.goto(`${origin}/lobby/7${query}`);await denied.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await denied.page.getByText(expected,{exact:false}).waitFor();check(!members.has(5),`권한 없는 입장 차단: ${expected}`);}
 for(const [flag,expected] of [['expired','유효 시간이 지났습니다'],['revoked','폐기한 초대 링크']]){const url=await issue(),t=new URL(url).searchParams.get('invite');invites.get(t)[flag]=true;await denied.page.goto(url);await denied.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await denied.page.getByText(expected,{exact:false}).waitFor();check(!members.has(5),`초대 오류 안내: ${flag}`);}
 const lockLink=await issue();locked=true;await denied.page.goto(lockLink);await denied.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await denied.page.getByText('호스트가 새 참가자 입장을 잠갔습니다.',{exact:false}).waitFor();check(!members.has(5),'유효한 링크도 방 잠금 우회 불가');
 for(const c of [host,guest,signup,paste,denied])check(!await c.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${c.id}번 계정 화면 가로 넘침 없음`);
 check(await guest.page.getByRole('button',{name:'호스트 관리',exact:true}).count()===0,'MEMBER에게 방 설정 관리 숨김');
 await host.page.getByRole('button',{name:'호스트 관리',exact:true}).click();await host.page.getByLabel('변경할 회의실 이름',{exact:true}).fill('수정된 비공개 회의');await host.page.getByRole('button',{name:'방 설정 저장',exact:true}).click();await host.page.getByText('방 설정을 저장했어요.',{exact:true}).waitFor();await guest.page.getByRole('heading',{name:'수정된 비공개 회의',exact:false}).waitFor();check(room.title==='수정된 비공개 회의'&&room.visibility==='PRIVATE','호스트 이름 수정과 다른 참가자 화면 반영');check(locked,'설정 저장이 기존 입장 잠금을 해제하지 않음');
 room.title='다른 화면에서 변경';await host.page.getByLabel('변경할 회의실 이름',{exact:true}).fill('내 미저장 설정');await host.page.getByRole('button',{name:'방 설정 저장',exact:true}).click();await host.page.getByText('다른 화면에서 방 설정을 수정했습니다.',{exact:false}).waitFor();check(await host.page.getByLabel('변경할 회의실 이름',{exact:true}).inputValue()==='내 미저장 설정'&&room.title==='다른 화면에서 변경','설정 충돌 409 시 입력 유지, 덮어쓰기 방지');
 host.page.once('dialog',d=>d.accept());await host.page.getByRole('button',{name:'최신 설정 불러오기',exact:true}).click();await host.page.waitForFunction(()=>document.querySelector('input[value="다른 화면에서 변경"]'));
 await host.page.getByLabel('변경할 회의실 이름',{exact:true}).fill('회의실 설정 완료');await host.page.getByLabel('변경할 공개 범위',{exact:true}).click();await host.page.getByRole('option',{name:'공개',exact:true}).click();const before=settingsRequests.length;host.page.once('dialog',d=>d.dismiss());await host.page.getByRole('button',{name:'방 설정 저장',exact:true}).click();check(settingsRequests.length===before&&room.visibility==='PRIVATE','공개 전환 확인 취소 시 요청 없음');
 host.page.once('dialog',d=>d.accept());await host.page.getByRole('button',{name:'방 설정 저장',exact:true}).click();await host.page.getByText('방 설정을 저장했어요.',{exact:true}).waitFor();check(room.visibility==='PUBLIC','호스트 확인 후 공개 전환');await host.page.getByRole('button',{name:'닫기',exact:true}).click();
 locked=false;await denied.page.goto(`${origin}/lobby/7`);await denied.page.getByRole('button',{name:'회의실 입장',exact:true}).click();await denied.page.getByRole('heading',{name:'회의실 설정 완료',exact:false}).waitFor();check(members.has(5),'공개 전환과 잠금 해제 후 신규 사용자 번호 입장');
 const mobileHost=await client(1,390);await mobileHost.page.goto(`${origin}/login`);await mobileHost.login();await mobileHost.page.getByRole('button',{name:'회의실 열기',exact:true}).click();await mobileHost.page.getByRole('button',{name:'호스트 관리',exact:true}).click();await mobileHost.page.getByLabel('변경할 회의실 이름',{exact:true}).fill('모바일에서 설정한 방');await mobileHost.page.getByRole('button',{name:'방 설정 저장',exact:true}).click();await mobileHost.page.getByText('방 설정을 저장했어요.',{exact:true}).waitFor();check(room.title==='모바일에서 설정한 방','390px 호스트 방 설정 저장');check(!await mobileHost.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'390px 설정 화면 가로 넘침 없음');
 check(errors.length===0,'페이지 실행 오류 없음');
 mkdirSync('tests/evidence',{recursive:true});writeFileSync('tests/evidence/room-settings-browser-results.json',JSON.stringify({backend:'mock REST and STOMP, no local PostgreSQL access',checks},null,2));console.log(JSON.stringify(checks));
}finally{await browser?.close();server.kill();}
