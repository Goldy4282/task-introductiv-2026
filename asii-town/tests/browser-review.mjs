import fs from 'node:fs';
import assert from 'node:assert/strict';
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();
const page=pages.find(p=>p.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression:`Promise.resolve(eval(${JSON.stringify(expression)})).then(v=>v instanceof Node?true:v)`,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(expression,limit=15000){const end=Date.now()+limit;while(Date.now()<end){if(await evaluate(expression))return;await delay(150);}throw Error('Timed out: '+expression);}
async function click(text,root='document'){return evaluate(`(()=>{const b=[...${root}.querySelectorAll('button')].find(b=>(b.textContent.trim()===${JSON.stringify(text)}||b.querySelector(':scope>span')?.textContent===${JSON.stringify(text)}));if(!b)throw Error('No button: '+${JSON.stringify(text)});b.click();return true;})()`);}
const screenshot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('artifacts/'+name+'.png',Buffer.from(r.data,'base64'));};
await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:5173/'});await wait(`document.querySelector('.quest-panel')`);

await evaluate(`localStorage.removeItem('asii-town-adventure-v3');location.reload()`);await wait(`document.querySelector('.game-canvas')`);await delay(700);
assert.equal(await evaluate(`!!document.querySelector('.location-panel,.world-marker,.controls-panel')`),false);
assert.ok(await evaluate(`getComputedStyle(document.querySelector('.quest-panel')).borderImageSource!=='none'`));
await screenshot('village-desktop');
async function travel(title){await evaluate(`document.querySelector('.village-map').open=true`);await evaluate(`(()=>{const b=[...document.querySelectorAll('.map-destinations button')].find(b=>b.textContent.includes(${JSON.stringify(title)}));if(!b)throw Error('No destination');b.click();})()`);await wait(`document.querySelector('.interior-header h2')?.textContent===${JSON.stringify(title)}`,25000);await delay(200);}
await travel('Casa exploratorului');await screenshot('personal-room-desktop');
assert.equal(await evaluate(`document.querySelectorAll('.interior-header .rpg-button').length`),1);
assert.equal(await evaluate(`document.querySelectorAll('.hud-actions .rpg-button:not(.journal-toggle)').length`),0);
await click('Deschide mini-jocul');await delay(200);
assert.equal(await evaluate(`!!document.querySelector('dialog[open]')`),false);
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('asii-town-adventure-v3')).won.length`),0);
assert.ok(await evaluate(`document.querySelector('.toast-message').textContent.includes('proprietar')`));
await click('Harta');await wait(`document.querySelector('.object-modal')?.open`);assert.equal(await evaluate(`document.activeElement.closest('dialog')!==null`),true);await evaluate(`document.querySelector('.object-modal .modal-close').click()`);
await click('Aprinde lampa UV');assert.ok(await evaluate(`document.querySelector('.hidden-writing')`));
await evaluate(`document.querySelector('.movable-rug').click()`);await click('Colectează suvenirul');assert.ok(await evaluate(`document.querySelector('.inventory-panel').textContent.includes('Suvenir')`));
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(300);await screenshot('personal-room-mobile');assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`));
assert.ok(await evaluate(`(()=>{const b=document.querySelector('.interior-header .rpg-button'),r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>0})()`));
await click('Înapoi în oraș');await click('Jurnal');await wait(`document.querySelector('.quest-panel.is-open')`);await screenshot('journal-mobile');await click('Jurnal');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await travel('Biblioteca satului');await click('Înapoi în oraș');await delay(400);await screenshot('forest-desktop');
assert.deepEqual(errors,[]);console.log('Browser passed: kit assets, simplified HUD, one exit, no demo game/rewards, object dialog, UV, collectible, forest navigation, mobile.');ws.close();
