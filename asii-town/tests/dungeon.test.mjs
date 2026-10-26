import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
async function load(entry){const r=await build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
const {initialProgress,progressReducer:reduce,loadProgress,canOpenSecret}=await load('src/game/progress.js');
const {MAZE,MAZE_START,MAZE_END,MEMORY,SECRET_ITEMS,validGame}=await load('src/houses/dungeon/logic.js');
const owners=['guest','maker','reader','artist'];
function allFragments(){return owners.reduce((s,id)=>reduce(s,{type:'win',id}),initialProgress);}
function mazePath(){const q=[[MAZE_START]],seen=new Set([String(MAZE_START)]);for(let i=0;i<q.length;i++){const path=q[i],[x,y]=path.at(-1);if(String([x,y])===String(MAZE_END))return path;for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const n=[x+dx,y+dy];if(MAZE[n[1]]?.[n[0]]==='0'&&!seen.has(String(n))){seen.add(String(n));q.push([...path,n]);}}}throw Error('Unsolvable maze');}
function activate(p){for(const id of owners)p=reduce(p,{type:'trapInsert',id,item:'fragment:'+id});return p;}
function solve(p){for(const [id,data] of [['maze',mazePath()],['logo',[0,1,2,3,4,5,6,7,8]],['memory',MEMORY]])p=reduce(p,{type:'trapSolve',id,data});return p;}
function escaped(){return reduce(solve(activate(reduce(allFragments(),{type:'visit',id:'trap'}))),{type:'escape'});}
test('entry requires all four actual fragments; trap blocks exit and other houses',()=>{
  assert.equal(reduce(initialProgress,{type:'visit',id:'trap'}),initialProgress);
  const incomplete={...allFragments(),inventory:['fragment:guest']};assert.equal(reduce(incomplete,{type:'visit',id:'trap'}),incomplete);
  const p=reduce(allFragments(),{type:'visit',id:'trap'});assert.equal(p.room,'trap');assert.equal(reduce(p,{type:'exit'}),p);assert.equal(reduce(p,{type:'visit',id:'guest'}),p);assert.equal(reduce(p,{type:'escape'}),p);
});
test('wrong items and invalid puzzle answers do not unlock anything',()=>{
  let p=reduce(allFragments(),{type:'visit',id:'trap'});
  assert.equal(reduce(p,{type:'trapInsert',id:'reader',item:'fragment:artist'}),p);
  assert.equal(reduce(p,{type:'trapSolve',id:'memory',data:MEMORY}),p);
  p=activate(p);assert.equal(p.trapSlots.length,4);
  assert.equal(reduce(p,{type:'trapSolve',id:'memory',data:[0]}),p);
  assert.equal(validGame('maze',[MAZE_START,MAZE_END]),false);
  assert.equal(validGame('maze',[[1,1],null]),false);
  assert.equal(validGame('logo',[0,0,0,0,0,0,0,0,0]),false);
});
test('all three games are mandatory, wins are idempotent, exit grants one key',()=>{
  let p=activate(reduce(allFragments(),{type:'visit',id:'trap'}));
  p=reduce(p,{type:'trapSolve',id:'maze',data:mazePath()});assert.equal(reduce(p,{type:'escape'}),p);
  p=solve(p);assert.equal(p.trapGames.length,3);
  const replay=reduce(p,{type:'trapSolve',id:'maze',data:mazePath()});assert.equal(replay,p);
  p=reduce(p,{type:'escape'});assert.equal(canOpenSecret(p),true);assert.equal(p.inventory.filter(i=>i==='key:secret').length,1);assert.equal(reduce(p,{type:'escape'}),p);
  assert.equal(reduce(p,{type:'exit'}).room,null);
});
test('reload preserves trap progress and lock; stale escape flags cannot skip games',()=>{
  const p=activate(reduce(allFragments(),{type:'visit',id:'trap'}));globalThis.localStorage={getItem:()=>JSON.stringify(p)};
  try {const loaded=loadProgress();assert.equal(loaded.room,'trap');assert.deepEqual(loaded.trapSlots,p.trapSlots);assert.equal(loaded.escaped,false);globalThis.localStorage={getItem:()=>JSON.stringify({...p,escaped:true,inventory:[...p.inventory,'key:secret']})};assert.equal(canOpenSecret(loadProgress()),false);}finally{delete globalThis.localStorage;}
});
test('secret has ten objects with at least two per owner and requires ten correct answers',()=>{
  assert.equal(SECRET_ITEMS.length,10);for(const id of owners)assert.ok(SECRET_ITEMS.filter(i=>i.owner===id).length>=2);
  let p=reduce(escaped(),{type:'visit',id:'secret'});assert.equal(p.room,'secret');
  for(const item of SECRET_ITEMS)p=reduce(p,{type:'attribute',id:item.id,owner:item.owner});
  p=reduce(p,{type:'attribute',id:SECRET_ITEMS[0].id,owner:'artist'});assert.equal(reduce(p,{type:'submit'}).secretSubmitted,false);
  p=reduce(p,{type:'attribute',id:SECRET_ITEMS[0].id,owner:SECRET_ITEMS[0].owner});p=reduce(p,{type:'submit'});assert.equal(p.secretSubmitted,true);
  assert.equal(reduce(p,{type:'attribute',id:SECRET_ITEMS[0].id,owner:'artist'}),p);
});
