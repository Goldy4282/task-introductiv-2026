import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PINS,TERMINALS,connect,evaluate} from '../src/houses/sughit-house/arduinoLogic.js';
test('only one complete wiring permutation wins',()=>{
  const permutations=a=>a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(rest=>[v,...rest])):[[]];
  let wins=0;
  for(const terminals of permutations(TERMINALS)){
    let state={};PINS.forEach((pin,i)=>{state=connect(state,pin.id,terminals[i].id);});
    if(evaluate(state).won)wins++;
  }
  assert.equal(wins,1);assert.equal(evaluate({}).won,false);
});
test('occupied destinations reject extra wires; failed circuits can be repaired',()=>{
  let state=connect({},'5V','ground');
  assert.equal(connect(state,'GND','ground'),state);
  assert.equal(evaluate(state).won,false);
  state=connect(state,'5V','power');state=connect(state,'GND','ground');
  state=connect(state,'D2','signal');state=connect(state,'D3','control');
  assert.deepEqual(evaluate(state),{won:true,wrong:[]});
  assert.equal(connect(state,'unknown','power'),state);
});
