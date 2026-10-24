import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
async function load(entry){const result=await build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}
const {initialProgress,progressReducer:reduce,canOpenSecret,loadProgress,STORAGE}=await load('src/game/progress.js');
const {MEMBERS}=await load('src/houses/content.js');
const world=await load('src/game/world.js');
const {findDirection}=await load('src/game/movement.js');
test('secret and trap remain locked until all personal games are won',()=>{
 let p={...initialProgress};assert.equal(canOpenSecret(p),false);
 assert.equal(reduce(p,{type:'visit',id:'secret'}),p);assert.equal(reduce(p,{type:'visit',id:'trap'}),p);
 for(const m of MEMBERS)p=reduce(p,{type:'win',id:m.id});
 assert.equal(p.inventory.length,4);assert.equal(canOpenSecret(p),false);
 const replay=reduce(p,{type:'win',id:MEMBERS[0].id});assert.equal(replay,p);
 p=reduce(p,{type:'visit',id:'trap'});assert.equal(p.room,'trap');assert.equal(reduce(p,{type:'exit'}),p);
 assert.equal(reduce(p,{type:'visit',id:'guest'}),p);assert.equal(reduce({...p,room:null},{type:'escape'}).escaped,false);
 p=reduce(p,{type:'visit',id:'trap'});p=reduce(p,{type:'escape'});
 assert.equal(p.escaped,true);assert.equal(canOpenSecret(p),true);assert.equal(p.inventory.filter(x=>x==='fragment:final').length,1);
 assert.equal(reduce(p,{type:'exit'}).room,null);assert.equal(reduce(p,{type:'visit',id:'secret'}).room,'secret');
});
test('hints cap at three, collectibles are idempotent, final needs all eight answers',()=>{
 let p={...initialProgress};for(let i=0;i<9;i++)p=reduce(p,{type:'hint'});assert.equal(p.hints,3);
 p=reduce(p,{type:'collect',id:'keepsake:guest'});p=reduce(p,{type:'collect',id:'keepsake:guest'});assert.equal(p.inventory.length,1);
 for(const m of MEMBERS)p=reduce(p,{type:'win',id:m.id});p=reduce(p,{type:'visit',id:'trap'});p=reduce(p,{type:'escape'});
 assert.equal(reduce(p,{type:'submit'}).secretSubmitted,false);
 for(const m of MEMBERS)for(let i=0;i<2;i++)p=reduce(p,{type:'attribute',id:m.id+':'+i,owner:m.id});
 p=reduce(p,{type:'submit'});assert.equal(p.secretSubmitted,true);
 assert.equal(reduce(p,{type:'attribute',id:'guest:0',owner:'artist'}),p);
});
test('saved active trap cannot be escaped by refreshing; corrupt storage falls back',()=>{
 let p={...initialProgress};for(const m of MEMBERS)p=reduce(p,{type:'win',id:m.id});p=reduce(p,{type:'visit',id:'trap'});
 globalThis.localStorage={getItem:key=>{assert.equal(key,STORAGE);return JSON.stringify(p);}};
 const saved=loadProgress();assert.equal(saved.room,'trap');assert.equal(saved.escaped,false);
 globalThis.localStorage={getItem:()=>'{broken'};assert.deepEqual(loadProgress(),initialProgress);delete globalThis.localStorage;
});
test('every door is reachable, bounded movement finds each route, houses stay on land',()=>{
 for(const house of world.HOUSES){
  const end=world.doorTile(house);assert.ok(world.findPath(world.startingTile,end).length,house.id+' has a path');
  for(let x=house.x;x<house.x+house.w;x++)for(let y=house.y;y<house.y+house.h;y++)assert.ok(world.isLand(x,y),house.id+' footprint is land');
  let tile={...world.startingTile};const seen=new Set();
  for(let i=0;i<300&&(tile.x!==end.x||tile.y!==end.y);i++){
   const key=tile.x+','+tile.y;assert.ok(!seen.has(key),house.id+' does not loop');seen.add(key);
   const d=findDirection(tile,end.x,end.y);tile={x:tile.x+(d===6?1:d===4?-1:0),y:tile.y+(d===2?1:d===8?-1:0)};assert.equal(world.isBlocked(tile.x,tile.y),false,house.id+' movement stays walkable');
  }
  assert.deepEqual(tile,end,house.id+' reached');
 }
 for(let y=0;y<world.ROWS;y++)for(let x=0;x<world.COLS;x++)if(!world.isLand(x,y))assert.ok(world.isBlocked(x,y),'forest perimeter blocks movement');
});

test('tree trunks block movement and paths remain clear',()=>{
 const interior=world.TREES.filter(t=>!t.edge);assert.ok(interior.length>0);
 for(const t of world.TREES){assert.equal(world.hasTree(t.x,t.y),true);assert.equal(world.isBlocked(t.x,t.y),true);assert.deepEqual(world.findPath(world.startingTile,{x:t.x,y:t.y}),[]);}
 for(const t of interior)assert.equal(world.isPath(t.x,t.y),false);
 for(const a of world.HOUSES)for(const b of world.HOUSES)if(a!==b)assert.ok(world.findPath(world.doorTile(a),world.doorTile(b)).length,a.id+' to '+b.id);
});
