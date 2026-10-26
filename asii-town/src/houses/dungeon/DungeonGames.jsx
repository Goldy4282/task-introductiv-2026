import {useEffect,useRef,useState} from 'react';
import logo from '../../assets/andrei-room/asii.png';
import {MAZE,MAZE_START,MAZE_END,MEMORY} from './logic';
export function MazeGame({onSolve}){
  const [path,setPath]=useState([MAZE_START]);const pos=path.at(-1),won=String(pos)===String(MAZE_END);
  function move(dx,dy){if(won)return;const next=[pos[0]+dx,pos[1]+dy];if(MAZE[next[1]]?.[next[0]]==='0')setPath([...path,next]);}
  return <div className="dg-game" onKeyDown={e=>{const dir={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]}[e.key];if(dir){e.preventDefault();move(...dir);}}}>
    <p>Du lumina de la intrare la stea. Folosește săgețile sau butoanele.</p>
    <div className="dg-maze" tabIndex={0} role="group" aria-label="Labirint; folosește săgețile">{MAZE.flatMap((row,y)=>[...row].map((cell,x)=><span key={`${x},${y}`} className={cell==='1'?'wall':pos[0]===x&&pos[1]===y?'player':''}>{pos[0]===x&&pos[1]===y?'●':MAZE_END[0]===x&&MAZE_END[1]===y?'★':''}</span>))}</div>
    <div className="dg-controls">{[['↑',0,-1],['←',-1,0],['↓',0,1],['→',1,0]].map(([label,x,y])=><button className="rpg-button" key={label} disabled={won} onClick={()=>move(x,y)}>{label}</button>)}</div>
    {won&&<button className="rpg-button" onClick={()=>onSolve(path)}>Labirint rezolvat · activează sigiliul</button>}
  </div>;
}
export function LogoGame({onSolve}){
  // O permutare nesortată; orice două piese se pot schimba între ele.
  const [tiles,setTiles]=useState([4,0,7,2,8,1,6,3,5]),[selected,setSelected]=useState(null),[preview,setPreview]=useState(false);
  const won=tiles.every((tile,i)=>tile===i);
  function choose(i){if(won)return;if(selected===null)setSelected(i);else{setTiles(old=>{const next=[...old];[next[i],next[selected]]=[next[selected],next[i]];return next;});setSelected(null);}}
  return <div className="dg-game"><p>Refă logoul ASII. Apasă două piese pentru a le schimba între ele.</p><button className="rpg-button" onClick={()=>setPreview(v=>!v)}>{preview?'Ascunde modelul':'Vezi modelul'}</button>{preview&&<img className="dg-logo-preview" src={logo} alt="Modelul logoului ASII"/>}
    <div className="dg-puzzle">{tiles.map((tile,i)=><button key={i} aria-label={`Piesa ${tile+1}, poziția ${i+1}`} aria-pressed={selected===i} disabled={won} onClick={()=>choose(i)} style={{backgroundImage:`url(${logo})`,backgroundSize:'300% 300%',backgroundPosition:`${tile%3*50}% ${Math.floor(tile/3)*50}%`}}><span>{tile+1}</span></button>)}</div>
    {won&&<button className="rpg-button" onClick={()=>onSolve(tiles)}>Logo refăcut · activează sigiliul</button>}
  </div>;
}
export function MemoryGame({onSolve}){
  const [flash,setFlash]=useState(-1),[showing,setShowing]=useState(false),[input,setInput]=useState([]),[ready,setReady]=useState(false),[message,setMessage]=useState('Privește secvența, apoi repet-o.');
  const timers=useRef([]);useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  function play(){timers.current.forEach(clearTimeout);setShowing(true);setReady(false);setInput([]);setMessage('Urmărește runele…');MEMORY.forEach((n,i)=>{timers.current.push(setTimeout(()=>setFlash(n),400+i*750));timers.current.push(setTimeout(()=>setFlash(-1),900+i*750));});timers.current.push(setTimeout(()=>{setShowing(false);setReady(true);setMessage('Acum repetă secvența.');},MEMORY.length*750+400));}
  function choose(n){if(!ready||showing)return;const next=[...input,n];if(n!==MEMORY[input.length]){setReady(false);setMessage('Secvență greșită. Poți asculta din nou.');return;}setInput(next);if(next.length===MEMORY.length){setReady(false);onSolve(next);}}
  return <div className="dg-game"><p role="status">{message} {ready?`${input.length}/${MEMORY.length}`:''}</p><div className="dg-runes">{['☀','☾','✦','◇'].map((rune,i)=><button key={rune} className={flash===i?'lit':''} disabled={!ready||showing} aria-label={`Runa ${i+1}`} onClick={()=>choose(i)}>{rune}</button>)}</div><button className="rpg-button" disabled={showing} onClick={play}>Arată secvența</button></div>;
}
