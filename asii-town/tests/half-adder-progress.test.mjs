import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { verifyCircuit } from '../src/houses/dragos-room/halfAdderLogic.mjs';

const bundled = await build({
  entryPoints:['src/game/progress.js'],bundle:true,write:false,format:'esm',platform:'node',
  plugins:[{name:'room-stubs',setup(build){build.onLoad({filter:/\.jsx$/},()=>({contents:'export default function Room(){}',loader:'js'}));}}],
});
const {initialProgress,initialLabCircuit,progressReducer,loadProgress,normalizeLabCircuit,STORAGE} =
  await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));

test('lab circuit is initialized with unconnected sockets and low input signals',()=>{
  assert.deepEqual(initialProgress.labCircuit,{sum:null,carry:null,a:0,b:0});
});

test('placing gates and switching inputs updates persistent game progress',()=>{
  let p={...initialProgress};
  p=progressReducer(p,{type:'labPlace',slot:'sum',gate:'XOR'});
  p=progressReducer(p,{type:'labPlace',slot:'carry',gate:'AND'});
  p=progressReducer(p,{type:'labInputs',a:1,b:0});
  assert.deepEqual(p.labCircuit,{sum:'XOR',carry:'AND',a:1,b:0});
  assert.deepEqual(verifyCircuit(p.labCircuit).passed,true);
  assert.equal(p.won.length,0);
});

test('lab circuit survives a full save and reload',()=>{
  let p={...initialProgress};
  p=progressReducer(p,{type:'labPlace',slot:'sum',gate:'XOR'});
  p=progressReducer(p,{type:'labPlace',slot:'carry',gate:'AND'});
  p=progressReducer(p,{type:'labInputs',a:1,b:1});
  globalThis.localStorage={getItem:key=>{assert.equal(key,STORAGE);return JSON.stringify(p);}};
  try {
    const loaded=loadProgress();
    assert.deepEqual(loaded.labCircuit,{sum:'XOR',carry:'AND',a:1,b:1});
    assert.equal(verifyCircuit(loaded.labCircuit).passed,true);
  }finally{delete globalThis.localStorage;}
});

test('winning repairs the computer, grants exactly one fragment and preserves correct circuit',()=>{
  let p={...initialProgress};
  p=progressReducer(p,{type:'labPlace',slot:'sum',gate:'XOR'});
  p=progressReducer(p,{type:'labPlace',slot:'carry',gate:'AND'});
  p=progressReducer(p,{type:'win',id:'guest'});
  const once=p;
  p=progressReducer(p,{type:'win',id:'guest'});
  assert.equal(p,once);
  assert.deepEqual(p.labCircuit,{sum:'XOR',carry:'AND',a:0,b:0});
  assert.deepEqual(p.won,['guest']);
  assert.deepEqual(p.inventory,['fragment:guest']);
  assert.equal(progressReducer(p,{type:'labReset'}),p);
});

test('invalid and old saves cannot introduce unknown gates or non-binary inputs',()=>{
  const old={...initialProgress};delete old.labCircuit;
  globalThis.localStorage={getItem:()=>JSON.stringify(old)};
  try{assert.deepEqual(loadProgress().labCircuit,initialLabCircuit);}finally{delete globalThis.localStorage;}
  const malformed={...initialProgress,labCircuit:{sum:'HACK',carry:'AND',a:7,b:'1'}};
  globalThis.localStorage={getItem:()=>JSON.stringify(malformed)};
  try{assert.deepEqual(loadProgress().labCircuit,{sum:null,carry:'AND',a:0,b:0});}finally{delete globalThis.localStorage;}
  assert.deepEqual(normalizeLabCircuit(null),initialLabCircuit);
});

test('previously won saves without circuit details restore a valid half-adder',()=>{
  const old={...initialProgress,won:['guest'],inventory:['fragment:guest']};
  delete old.labCircuit;
  globalThis.localStorage={getItem:()=>JSON.stringify(old)};
  try{const saved=loadProgress();assert.equal(verifyCircuit(saved.labCircuit).passed,true);}finally{delete globalThis.localStorage;}
});

test('reset clears only the unfinished lab circuit and preserves the rest of the game',()=>{
  let p={...initialProgress,visited:['guest'],hints:2};
  p=progressReducer(p,{type:'labPlace',slot:'sum',gate:'OR'});
  p=progressReducer(p,{type:'labReset'});
  assert.deepEqual(p.labCircuit,initialLabCircuit);
  assert.deepEqual(p.visited,['guest']);
  assert.equal(p.hints,2);
});
