import {useState} from 'react';
import {KeyRound,LockKeyhole,Map,Microchip,Beer,Flame,Footprints,Puzzle,Brain} from 'lucide-react';
import DetailDialog from '../../components/DetailDialog';
import {MEMBERS} from '../content';
import {GAME_IDS,mechanismsReady,gamesReady} from './logic';
import {MazeGame,LogoGame,MemoryGame} from './DungeonGames';
import './dungeon.css';
const SOCKETS=[
  {id:'guest',title:'Cadranul călătorului',hint:'Două rotițe numerotate și o fantă pentru un cartonaș de traseu. Pe margine sunt gravate urme de pași.',Icon:Map},
  {id:'maker',title:'Micul prizonier',hint:'O maimuță de piatră întinde mâna prin gratii. Lângă ea se află o coajă galbenă, uscată.',Icon:Flame},
  {id:'reader',title:'Panoul de comandă',hint:'Un locaș dreptunghiular, două rânduri de contacte și un cablu USB liber. Indicatorul de alimentare este stins.',Icon:Microchip},
  {id:'artist',title:'Masa temnicerului',hint:'Un desfăcător ruginit, un suport rotund pentru sticlă și o urmă de spumă pe masă.',Icon:Beer},
];
const GAMES=[{id:'maze',name:'Coridorul fără lumină',Icon:Footprints,Component:MazeGame},{id:'logo',name:'Blazonul sfărâmat',Icon:Puzzle,Component:LogoGame},{id:'memory',name:'Ecoul runelor',Icon:Brain,Component:MemoryGame}];
export default function DungeonRoom({progress,dispatch,onExit,notify,selectedItem,onUse}){
  const [socket,setSocket]=useState(null),[game,setGame]=useState(null),[message,setMessage]=useState('');
  const slots=progress.trapSlots||[],solved=progress.trapGames||[],remaining=GAME_IDS.length-solved.length;
  function insert(item){if(item!=='fragment:'+socket.id){setMessage(item?'Obiectul nu se potrivește cu mecanismul.':'Selectează un fragment din inventar, apoi încearcă mecanismul.');return;}dispatch({type:'trapInsert',id:socket.id,item});onUse?.();setMessage('Mecanismul se pune în mișcare. Un lanț cade pe podea.');}
  function solve(data){dispatch({type:'trapSolve',id:game.id,data});setGame(null);notify('Un sigiliu s-a stins. Verifică ușa temniței.');}
  function leave(){if(!mechanismsReady(progress)||!gamesReady(progress)){notify('Ușa rămâne încuiată. Activează mecanismele și stinge toate sigiliile.');return;}dispatch({type:'escape'});dispatch({type:'exit'});notify('Ai ieșit din temniță! Ai primit cheia Casei Secrete.');}
  return <section className="interior-room dungeon-room"><header className="interior-header"><div><p className="eyebrow">SUB SAT · TEMNIȚA CELOR PATRU</p><h2>Casa Capcană</h2><p>Potrivește amintirile cu mecanismele. Apoi înfruntă cele trei încercări.</p></div><span><LockKeyhole size={18}/> Înăuntru până la ultima probă</span></header>
    <div className="dg-interior"><div className="dg-torches" aria-hidden="true">♨<span>♨</span></div><div className="dg-sockets">{SOCKETS.map(({Icon,...s})=><button className={`dg-socket ${slots.includes(s.id)?'activated':''}`} key={s.id} onClick={()=>{setSocket(s);setMessage('');}}><Icon size={42}/><strong>{s.title}</strong><small>{slots.includes(s.id)?'Mecanism activat':'Inspectează'}</small></button>)}</div>
      <div className="dg-games">{GAMES.map(({Icon,...g})=><button className="dg-challenge" key={g.id} disabled={!mechanismsReady(progress)||solved.includes(g.id)} onClick={()=>setGame(g)}><Icon size={30}/><strong>{g.name}</strong><small>{solved.includes(g.id)?'Sigiliu stins':mechanismsReady(progress)?'Începe încercarea':'Lanțurile mecanismelor blochează accesul'}</small></button>)}</div>
      <div className="dg-exit"><div className="dg-door" aria-hidden="true">{gamesReady(progress)&&mechanismsReady(progress)?<KeyRound size={46}/>:<LockKeyhole size={46}/>}</div><div><strong role="status">{remaining} jocuri rămase până la ieșire</strong><p>{slots.length}/4 mecanisme activate</p><button className="rpg-button" disabled={!gamesReady(progress)||!mechanismsReady(progress)} onClick={leave}>Deschide ușa și ia cheia</button>{progress.escaped&&<button className="rpg-button" onClick={onExit}>Înapoi în oraș</button>}</div></div>
    </div>
    {socket&&<DetailDialog title={socket.title} onClose={()=>setSocket(null)}><p>{socket.hint}</p><p role="status">{message}</p><button className="rpg-button" disabled={slots.includes(socket.id)} onClick={()=>insert(selectedItem)}>{slots.includes(socket.id)?'Activat':'Folosește obiectul selectat'}</button>{!slots.includes(socket.id)&&<div className="dg-controls dg-fragment-options">{MEMBERS.map(m=><button key={m.id} className="rpg-button" onClick={()=>insert('fragment:'+m.id)}>{m.fragmentLabel||m.fragment}</button>)}</div>}</DetailDialog>}
    {game&&<DetailDialog title={game.name} onClose={()=>setGame(null)}><game.Component onSolve={solve}/></DetailDialog>}
  </section>;
}
