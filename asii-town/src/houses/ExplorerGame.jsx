import {useRef,useState} from 'react';
export default function ExplorerGame({onWin,onClose}){
  const [route,setRoute]=useState([]),[message,setMessage]=useState('Reconstituie traseul notat pe hartă.'),[won,setWon]=useState(false);const awarded=useRef(false);
  function choose(n){if(won)return;const next=[...route,n];if(n!==[2,4,1,3][route.length]){setRoute([]);setMessage('Traseul se înfundă. Privește din nou harta.');return;}setRoute(next);if(next.length===4){setWon(true);setMessage('Ai găsit traseul! Cartonașul 24 este fragmentul tău.');if(!awarded.current){awarded.current=true;onWin?.();}}}
  return <div><p role="status">{message}</p><p>{route.join(' → ')||'Alege primul traseu'}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{[1,2,3,4].map(n=><button className="rpg-button" key={n} disabled={won} onClick={()=>choose(n)}>Traseul {n}</button>)}</div><button className="rpg-button" onClick={onClose}>Înapoi</button></div>;
}
