import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/game/progress.js'],bundle:true,write:false,format:'esm',platform:'node'});
const {initialProgress,progressReducer,loadProgress}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
test('each personal victory grants one fragment, including artist beer',()=>{
  let state=progressReducer(initialProgress,{type:'win',id:'artist'});
  assert.deepEqual(state.inventory,['fragment:artist']);
  assert.equal(progressReducer(state,{type:'win',id:'artist'}),state);
  state=progressReducer(state,{type:'win',id:'reader'});
  assert.deepEqual(state.inventory,['fragment:artist','fragment:reader']);
});
test('old Ursus token and fragment merge on load without losing wins',()=>{
  globalThis.localStorage={getItem:()=>JSON.stringify({...initialProgress,won:['artist','reader'],inventory:['ursus:artist','fragment:artist','fragment:reader']})};
  try {
    const state=loadProgress();
    assert.deepEqual(state.inventory,['fragment:artist','fragment:reader']);
    assert.deepEqual(state.won,['reader','artist']);
  } finally {delete globalThis.localStorage;}
});
