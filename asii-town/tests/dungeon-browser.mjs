import assert from 'node:assert/strict';
const pages=await fetch('http://localhost:9223/json').then(r=>r.json());
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(expression,ms=10000){const end=Date.now()+ms;while(Date.now()<end){if(await evaluate(expression))return;await delay(100);}throw Error('Timeout: '+expression);}
async function click(selector,index=0){await evaluate(`document.querySelectorAll(${JSON.stringify(selector)})[${index}].click()`);await delay(50);}
try{
  await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://localhost:5173'});await wait(`Boolean(document.querySelector('.adventure'))`);
  // Only the isolated test browser profile is seeded; all subsequent actions use the UI.
  await evaluate(`(async()=>{const {initialProgress,STORAGE}=await import('/src/game/progress.js');const {MEMBERS}=await import('/src/houses/content.js');localStorage.setItem(STORAGE,JSON.stringify({...initialProgress,room:'trap',won:MEMBERS.map(m=>m.id),inventory:MEMBERS.map(m=>'fragment:'+m.id)}));location.reload();})()`);
  await wait(`Boolean(document.querySelector('.dg-sockets'))`);
  assert.equal(await evaluate(`document.querySelectorAll('.dg-challenge:disabled').length`),3);
  for(let i=0;i<4;i++){
    await click('.dg-socket',i);
    if(i===0){await click('.dg-fragment-options button',1);assert.equal(await evaluate(`JSON.parse(localStorage.getItem('asii-town-adventure-v3')).trapSlots.length`),0);}
    await click('.dg-fragment-options button',i);await click('.object-modal .modal-close');
  }
  assert.equal(await evaluate(`document.querySelectorAll('.dg-challenge:disabled').length`),0);
  await click('.dg-challenge',0);
  const path=await evaluate(`(async()=>{const {MAZE,MAZE_START,MAZE_END}=await import('/src/houses/dungeon/logic.js');const q=[[MAZE_START]],seen=new Set([String(MAZE_START)]);for(let i=0;i<q.length;i++){const p=q[i],[x,y]=p.at(-1);if(String([x,y])===String(MAZE_END))return p;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[x+dx,y+dy];if(MAZE[n[1]]?.[n[0]]==='0'&&!seen.has(String(n))){seen.add(String(n));q.push([...p,n]);}}}})()`);
  for(let i=1;i<path.length;i++){
    const [x,y]=path[i],[px,py]=path[i-1];const key=x>px?'ArrowRight':x<px?'ArrowLeft':y>py?'ArrowDown':'ArrowUp';
    await evaluate(`document.querySelector('.dg-maze').dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true}))`);await delay(15);
  }
  await evaluate(`[...document.querySelectorAll('.dg-game button')].at(-1).click()`);await delay(100);
  await evaluate('location.reload()');await wait(`Boolean(document.querySelector('.dg-sockets'))`);
  assert.equal(await evaluate(`document.querySelectorAll('.dg-socket.activated').length`),4);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('asii-town-adventure-v3')).trapGames.length`),1);
  await click('.dg-challenge',1);
  for(let i=0;i<9;i++){
    const values=await evaluate(`[...document.querySelectorAll('.dg-puzzle button')].map(b=>Number(b.getAttribute('aria-label').match(/\\d+/)[0])-1)`);
    if(values[i]===i)continue;await click('.dg-puzzle button',i);await click('.dg-puzzle button',values.indexOf(i));
  }
  await evaluate(`[...document.querySelectorAll('.dg-game button')].at(-1).click()`);await delay(100);
  await click('.dg-challenge',2);await click('.dg-game>.rpg-button');await wait(`!document.querySelector('.dg-runes button').disabled`,7000);
  for(const n of [0,2,1,3,2])await click('.dg-runes button',n);
  assert.equal(await evaluate(`document.querySelector('.dg-exit button').disabled`),false);
  await click('.dg-exit button');await wait(`Boolean(document.querySelector('.game-canvas'))`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('asii-town-adventure-v3')).inventory.includes('key:secret')`),true);
  await evaluate(`document.querySelector('.village-map').open=true;[...document.querySelectorAll('.map-destinations button')].find(b=>b.textContent.includes('Secret')).click()`);
  await wait(`Boolean(document.querySelector('.dg-secret-content'))`,30000);
  assert.equal(await evaluate(`document.querySelectorAll('.replica').length`),10);
  await evaluate(`document.querySelectorAll('.replica select').forEach(s=>{s.value='guest';s.dispatchEvent(new Event('change',{bubbles:true}));})`);await delay(100);
  await click('.dg-secret-content>.rpg-button');assert.equal(await evaluate(`Boolean(document.querySelector('.dg-victory'))`),false);
  await evaluate(`(async()=>{const {SECRET_ITEMS}=await import('/src/houses/dungeon/logic.js');const order=[5,0,8,3,6,1,9,4,2,7];document.querySelectorAll('.replica select').forEach((s,i)=>{s.value=SECRET_ITEMS[order[i]].owner;s.dispatchEvent(new Event('change',{bubbles:true}));});})()`);await delay(100);
  await click('.dg-secret-content>.rpg-button');await wait(`Boolean(document.querySelector('.dg-victory'))`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('asii-town-adventure-v3')).secretSubmitted`),true);
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await delay(100);
  assert.ok(await evaluate(`document.querySelector('.dg-victory h1').getBoundingClientRect().right<390`));
  assert.deepEqual(errors,[]);console.log('PASS: four sockets, wrong item rejection, maze, logo, memory, reload lock/progress, exit key, secret door, ten answers, wrong-answer retry and victory.');
}finally{ws.close();}
