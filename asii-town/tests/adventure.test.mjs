import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
async function load(entry){const result=await build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'room-stubs',setup(b){b.onLoad({filter:/\.jsx$/},()=>({contents:'export default function Room(){}',loader:'js'}));}}]});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}
const {initialProgress,progressReducer:reduce,canOpenSecret,loadProgress,STORAGE}=await load('src/game/progress.js');
const {MEMBERS}=await load('src/houses/content.js');
const world=await load('src/game/world.js');
const {findDirection}=await load('src/game/movement.js');
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
