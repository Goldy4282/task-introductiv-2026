import {useEffect,useRef,useState} from 'react';
import {deal,hit,stand,score} from './blackjackLogic';
import './BlackjackGame.css';

export function Card({card,hidden=false}) {
  return <div className={`bj-card ${hidden?'bj-back':['♥','♦'].includes(card.suit)?'bj-red':''}`} aria-label={hidden?'Carte ascunsă':`${card.rank} ${card.suit}`}>
    {hidden?<span>✦</span>:<><small>{card.rank}<br/>{card.suit}</small><strong>{card.suit}</strong><small className="bj-corner">{card.rank}<br/>{card.suit}</small></>}
  </div>;
}
export default function BlackjackGame({onWin,onClose,completed=false}) {
  const [round,setRound]=useState(()=>deal());
  const awarded=useRef(completed);
  const won=round.result==='win';
  useEffect(()=>{if(won&&!awarded.current){awarded.current=true;onWin?.();}},[won,onWin]);
  const message=won?'Ai câștigat! Fragment primit: As de pică — A♠.':round.result==='loss'?'Dealerul câștigă. Mai încearcă o mână!':round.result==='push'?'Egalitate. Joacă o mână nouă.':'Cere o carte sau oprește-te. Câștigă o mână pentru a primi asul de pică.';
  return <div className="blackjack-game">
    <p>Apropie-te de <strong>21</strong> fără să depășești. Figurile valorează 10, asul 1 sau 11. Dealerul trage până la 17. Blackjack-ul din două cărți bate un 21 obișnuit.</p>
    <div className="bj-felt">
      <section aria-label="Mâna dealerului"><h3>Dealer · {round.result?score(round.dealer):`${score([round.dealer[0]])} + ?`}</h3><div className="bj-hand" style={{'--cards':round.dealer.length}}>{round.dealer.map((card,i)=><Card key={i} card={card} hidden={!round.result&&i===1}/>)}</div></section>
      <div className="bj-divider">BLACKJACK · 21</div>
      <section aria-label="Mâna ta"><h3>Tu · {score(round.player)}</h3><div className="bj-hand" style={{'--cards':round.player.length}}>{round.player.map((card,i)=><Card key={i} card={card}/>)}</div></section>
    </div>
    <p className={`bj-feedback ${won?'bj-victory':''}`} role="status">{message}</p>
    <div className="bj-actions">
      <button className="rpg-button" disabled={Boolean(round.result)} onClick={()=>setRound(old=>hit(old))}>Mai vreau o carte</button>
      <button className="rpg-button" disabled={Boolean(round.result)} onClick={()=>setRound(old=>stand(old))}>Mă opresc</button>
      {round.result&&<button className="rpg-button" onClick={()=>setRound(deal())}>Mână nouă</button>}
      <button className="rpg-button" onClick={onClose}>Înapoi în cameră</button>
    </div>
    <small>Joc fără mize. Fragmentul se acordă o singură dată.</small>
  </div>;
}
