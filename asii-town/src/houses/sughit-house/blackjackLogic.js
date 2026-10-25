const SUITS=['♠','♥','♦','♣'];
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export function createDeck(random=Math.random) {
  const deck=SUITS.flatMap(suit=>RANKS.map(rank=>({rank,suit})));
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
export function score(hand) {
  let total=0,aces=0;
  for(const card of hand){if(card.rank==='A'){total+=11;aces++;}else total+=['J','Q','K'].includes(card.rank)?10:Number(card.rank);}
  while(total>21&&aces){total-=10;aces--;}
  return total;
}
const natural=hand=>hand.length===2&&score(hand)===21;
export function settle(player,dealer) {
  const p=score(player),d=score(dealer);
  if(p>21)return 'loss';
  if(d>21)return 'win';
  if(natural(player)!==natural(dealer))return natural(player)?'win':'loss';
  return p===d?'push':p>d?'win':'loss';
}
export function deal(deck=createDeck()) {
  const player=[deck[0],deck[2]],dealer=[deck[1],deck[3]];
  return {player,dealer,deck:deck.slice(4),result:natural(player)||natural(dealer)?settle(player,dealer):null};
}
export function hit(round) {
  if(round.result||!round.deck.length)return round;
  const player=[...round.player,round.deck[0]];
  const next={...round,player,deck:round.deck.slice(1),result:score(player)>21?'loss':null};
  return score(player)===21?stand(next):next;
}
export function stand(round) {
  if(round.result)return round;
  const dealer=[...round.dealer],deck=[...round.deck];
  // Dealerul stă pe orice 17, inclusiv soft 17.
  while(score(dealer)<17&&deck.length)dealer.push(deck.shift());
  return {...round,dealer,deck,result:settle(round.player,dealer)};
}
