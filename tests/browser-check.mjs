import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server=spawn('node',['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'ignore'});
let browser;const results=[];
try{
 for(let i=0;i<60;i++){try{await fetch('http://127.0.0.1:5173');break;}catch{await new Promise(r=>setTimeout(r,200));}}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let subscription='sub-0',authenticated=false,sent=0;const room={id:7,title:'로컬 연동 검증',visibility:'PUBLIC'};
 await page.route(/^http:\/\/127\.0\.0\.1:5173\/api\//,async route=>{
  const req=route.request(),p=new URL(req.url()).pathname;let data={},status=200;
  if(p.endsWith('/ws-stomp/info'))data={websocket:true,cookie_needed:false,origins:['*:*'],entropy:123};
  else if(p.endsWith('/auth/login')||p.endsWith('/auth/refresh'))data={accessToken:'local-test-token'};
  else if(p.endsWith('/auth/me'))data={id:1,email:'demo@example.com',username:'검증 사용자',role:'USER',isBanned:false};
  else if(p==='/api/room')data=[room];
  else if(p.endsWith('/members'))data=[{userId:1,username:'검증 사용자',roleInRoom:'HOST',mute:false,handRaised:false},{userId:2,username:'발표자',roleInRoom:'PRESENTER',mute:false,handRaised:false}];
  else if(p.endsWith('/join/me'))data={};
  else if(p.endsWith('/create')){const b=req.postDataJSON();if(b.visibility!=='PUBLIC'||b.invitePolicy!=='LINK')throw Error('bad creation contract');data={...room,title:b.title};}
  else if(p==='/api/room/7')data=room;
  else{status=404;data={message:'missing mock '+p};}
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.routeWebSocket(/\/ws-stomp\/.*\/websocket/,ws=>{
  ws.send('o');ws.onMessage(raw=>{for(const f of JSON.parse(String(raw))){
   if(f.startsWith('CONNECT')){authenticated=f.includes('Authorization:Bearer local-test-token');ws.send('a'+JSON.stringify(['CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0']));}
   else if(f.startsWith('SUBSCRIBE')){subscription=f.match(/\nid:([^\n]+)/)[1];if(!f.includes('destination:/sub/chat/room/7'))throw Error('bad topic');}
   else if(f.startsWith('SEND')){sent++;const b=JSON.parse(f.split('\n\n')[1].replace(/\0$/,''));if(!f.includes('/pub/chat/room/7'))throw Error('bad publish');ws.send('a'+JSON.stringify([`MESSAGE\nsubscription:${subscription}\nmessage-id:${sent}\ndestination:/sub/chat/room/7\n\n${JSON.stringify({...b,sender:'검증 사용자'})}\0`]));}
   else if(f.startsWith('DISCONNECT')){const r=f.match(/\nreceipt:([^\n]+)/)?.[1];if(r)ws.send('a'+JSON.stringify([`RECEIPT\nreceipt-id:${r}\n\n\0`]));}
  }});
 });
 await page.goto('http://127.0.0.1:5173/login');
 await page.getByLabel('이메일',{exact:true}).fill('demo@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('Password123!');await page.getByRole('button',{name:'로그인',exact:true}).click();
 await page.getByRole('heading',{name:'내 회의실'}).waitFor();
 await page.getByLabel('입장할 회의실 번호').fill('7');await page.getByRole('button',{name:'번호로 입장'}).click();await page.getByText('연결됨',{exact:true}).waitFor();
 await page.getByLabel('채팅 메시지').fill(`실시간 검증 ${width}`);await page.getByRole('button',{name:'메시지 전송'}).click();await page.getByRole('log').getByText(`실시간 검증 ${width}`,{exact:true}).waitFor();
 if(!authenticated||sent!==1)throw Error('STOMP failed');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('horizontal overflow');
 if(process.env.TEST_KOREAN_FONT){await page.addStyleTag({content:`@font-face{font-family:TestKorean;src:url(data:font/otf;base64,${readFileSync(process.env.TEST_KOREAN_FONT).toString('base64')})}body,*{font-family:TestKorean,sans-serif!important}`});await page.evaluate(()=>document.fonts.ready);}
 await page.screenshot({path:`tests/room-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'회의실 나가기'}).click();await page.getByRole('heading',{name:'내 회의실'}).waitFor();
 await page.getByRole('button',{name:'새 회의실',exact:true}).click();await page.getByLabel('회의실 이름').fill('생성 검증');await page.getByRole('button',{name:'생성하고 입장'}).click();await page.getByText('연결됨',{exact:true}).waitFor();
 await page.reload();await page.getByText('연결됨',{exact:true}).waitFor();if(errors.length)throw Error(errors.join('\n'));
 results.push({width,passed:true,checks:['login','join','JWT CONNECT','subscribe','publish echo','leave','create','refresh','no overflow','no page errors']});await context.close();
 }
 writeFileSync('tests/browser-results.json',JSON.stringify({backend:'mock REST and SockJS/STOMP',results},null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill();}
