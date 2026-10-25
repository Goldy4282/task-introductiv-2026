import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeck,score,settle,deal,hit,stand} from '../src/houses/sughit-house/blackjackLogic.js';
const cards=(...ranks)=>ranks.map(rank=>({rank,suit:'♠'}));
test('deck contains 52 unique cards and flexible aces prevent false busts',()=>{
  const deck=createDeck();assert.equal(deck.length,52);
  assert.equal(new Set(deck.map(c=>c.rank+c.suit)).size,52);
  assert.equal(score(cards('A','A','9')),21);
  assert.equal(score(cards('A','9','5')),15);
});
test('natural blackjack beats ordinary 21 and equal naturals push',()=>{
  assert.equal(settle(cards('A','K'),cards('7','7','7')),'win');
  assert.equal(settle(cards('7','7','7'),cards('A','K')),'loss');
  assert.equal(settle(cards('A','Q'),cards('A','K')),'push');
  assert.equal(deal(cards('A','9','K','8')).result,'win');
});
test('hit busts immediately and completed hands cannot change',()=>{
  const round={player:cards('K','9'),dealer:cards('8','9'),deck:cards('5'),result:null};
  const next=hit(round);assert.equal(next.result,'loss');
  assert.equal(round.player.length,2);assert.equal(hit(next),next);assert.equal(stand(next),next);
});
test('dealer draws to 17, stands on soft 17, and ties are not victories',()=>{
  const round={player:cards('K','9'),dealer:cards('9','5'),deck:cards('2','8'),result:null};
  const next=stand(round);assert.equal(next.result,'win');assert.equal(next.dealer.length,4);
  const soft=stand({...round,dealer:cards('A','6')});assert.equal(soft.dealer.length,2);
  assert.equal(stand({...round,player:cards('10','7'),dealer:cards('9','8')}).result,'push');
});
test('hitting 21 automatically plays the dealer and ends the round',()=>{
  const round={player:cards('10','5'),dealer:cards('9','5'),deck:cards('6','4'),result:null};
  const next=hit(round);
  assert.equal(score(next.player),21);
  assert.equal(score(next.dealer),18);
  assert.equal(next.result,'win');
  assert.equal(hit(next),next);
  assert.equal(hit({...round,deck:cards('6','7')}).result,'push');
  assert.equal(hit({...round,deck:cards('4','7')}).result,null);
});
