import {useRef,useState} from 'react';
import {PINS,TERMINALS,connect,evaluate} from './arduinoLogic';
import './ArduinoGame.css';
const wire=(y,x2,y2)=>`M 245 ${y} C 325 ${y}, ${x2-80} ${y2}, ${x2} ${y2}`;
export default function ArduinoGame({onWin,onClose,completed=false}){
  const svg=useRef(null),active=useRef(null),awarded=useRef(completed);
  const [connections,setConnections]=useState({}),[drag,setDrag]=useState(null);
  const [status,setStatus]=useState('idle'),[wrong,setWrong]=useState([]),[attempt,setAttempt]=useState(0);
  const [message,setMessage]=useState('Trage fiecare pin la borna cu aceeași etichetă.');
  const won=status==='won';
  function point(e){const matrix=svg.current.getScreenCTM();if(!matrix)return null;const p=svg.current.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(matrix.inverse());}
  function cancel(){active.current=null;setDrag(null);}
  function clear(){setStatus('idle');setWrong([]);}
  function begin(e,pin){
    if(won||active.current||e.button!==0)return;
    e.preventDefault();const p=point(e);if(!p)return;
    active.current={pin,pointerId:e.pointerId};svg.current.setPointerCapture(e.pointerId);clear();setDrag({pin,point:p});
  }
  function finish(e){
    const a=active.current;if(!a||a.pointerId!==e.pointerId)return;
    const p=point(e),terminal=p&&TERMINALS.find(t=>Math.hypot(p.x-430,p.y-t.y)<=25);
    if(terminal){const next=connect(connections,a.pin,terminal.id);setConnections(next);setMessage(next===connections?'Borna este ocupată. Șterge firul existent.':'Fir conectat. Continuă, apoi pornește circuitul.');}
    cancel();if(svg.current.hasPointerCapture(e.pointerId))svg.current.releasePointerCapture(e.pointerId);
  }
  function remove(pin){if(won)return;setConnections(old=>{const next={...old};delete next[pin];return next;});clear();}
  function start(){
    if(won||drag)return;
    const result=evaluate(connections);setWrong(result.wrong);setAttempt(n=>n+1);setStatus(result.won?'won':'failed');
    setMessage(result.won?'Felicitări! Ai reparat Arduino-ul!':'Ai ars iar placa! Corectează firele roșii și bornele neconectate.');
    if(result.won&&!awarded.current){awarded.current=true;onWin?.();}
  }
  return <div className={`arduino-game ${won?'arduino-won':''}`}>
    <p>Conectează 5V, GND, D2 și D3. Trage din nou de un pin pentru a muta firul; apasă pe fir ca să-l ștergi.</p>
    <svg ref={svg} viewBox="0 0 740 330" role="group" aria-label="Circuit Arduino interactiv" onPointerMove={e=>{if(active.current?.pointerId===e.pointerId){const p=point(e);if(p)setDrag({pin:active.current.pin,point:p});}}} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={e=>{if(e.key==='Escape'&&drag){e.preventDefault();e.stopPropagation();cancel();}}}>
      <rect x="2" y="2" width="736" height="326" rx="12" fill="#182724" stroke="#81926e"/>
      <rect x="25" y="35" width="245" height="265" rx="16" fill="#246f69" stroke="#84b9a6" strokeWidth="3"/>
      <rect x="14" y="80" width="43" height="58" rx="4" fill="#b3bbae"/>
      <rect x="75" y="135" width="65" height="80" fill="#162b29"/>
      {[0,1,2,3,4,5].map(i=><path key={i} d={`M 66 ${143+i*13} h9 M 140 ${143+i*13} h9`} stroke="#bfc2ac" strokeWidth="4"/>)}
      <rect x="55" y="245" width="67" height="30" rx="4" fill="#162b29"/>
      <text x="48" y="60" fill="#fff0cf" fontSize="19">ARDUINO UNO</text>
      <rect x="410" y="35" width="305" height="265" rx="12" fill="#d4ccb0"/>
      <text x="440" y="60" fill="#34443a" fontSize="16">CIRCUIT LED</text>
      <path d="M 450 90 H 665 V 125 M 450 150 H 620 M 450 210 H 665 V 175 M 450 270 H 620 V 175" fill="none" stroke="#7b8a70" strokeWidth="3"/>
      <circle className="arduino-led" cx="660" cy="150" r="22" fill={won?'#a8ff87':'#54614b'} stroke="#344534" strokeWidth="4"/>
      {PINS.map(pin=>{const t=TERMINALS.find(t=>t.id===connections[pin.id]);return t&&drag?.pin!==pin.id?<g key={pin.id}><path d={wire(pin.y,430,t.y)} fill="none" stroke={wrong.includes(pin.id)?'#ff756f':pin.color} strokeWidth="5"/><path d={wire(pin.y,430,t.y)} className="arduino-wire-hit" onClick={()=>remove(pin.id)}><title>Șterge {pin.id}</title></path></g>:null;})}
      {drag&&<path d={wire(PINS.find(p=>p.id===drag.pin).y,drag.point.x,drag.point.y)} fill="none" stroke={PINS.find(p=>p.id===drag.pin).color} strokeWidth="5" strokeDasharray="8 4" pointerEvents="none"/>}
      {PINS.map(pin=><g key={pin.id} className="arduino-pin" role="button" tabIndex={won?-1:0} aria-label={`Pin ${pin.id}`} onPointerDown={e=>begin(e,pin.id)} onKeyDown={e=>{if(!won&&(e.key==='Enter'||e.key===' ')){e.preventDefault();clear();setDrag({pin:pin.id,point:{x:245,y:pin.y}});}}}><text x="215" y={pin.y+5} textAnchor="end" fill="#fff0cf" fontSize="18">{pin.id}</text><circle cx="245" cy={pin.y} r="23" fill="transparent"/><circle cx="245" cy={pin.y} r="10" fill={pin.color} stroke="#152c28" strokeWidth="3"/></g>)}
      {TERMINALS.map(t=><g key={t.id} className="arduino-pin" role="button" tabIndex={won?-1:0} aria-label={t.label} onKeyDown={e=>{if(!won&&drag&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const next=connect(connections,drag.pin,t.id);setConnections(next);setMessage(next===connections?'Borna este ocupată.':'Fir conectat.');cancel();}}}><circle cx="430" cy={t.y} r="24" fill="transparent"/><circle cx="430" cy={t.y} r="10" fill={status==='failed'&&!Object.values(connections).includes(t.id)?'#ff756f':'#f5e6b4'} stroke="#435448" strokeWidth="3"/><text x="450" y={t.y+5} fill="#243e35" fontSize="14">{t.label}</text></g>)}
      {status==='failed'&&<g key={attempt} className="arduino-smoke" pointerEvents="none">{[0,1,2].map(i=><circle key={i} cx={95+i*26} cy={125-i*12} r={16+i*5} fill="#bac1b3"/>)}</g>}
    </svg>
    <p className={`arduino-feedback arduino-${status}`} role="status">{message}</p>
    <div className="arduino-actions"><button className="rpg-button" onClick={start} disabled={won||Boolean(drag)}>Pornește circuitul</button>{!won&&<button className="rpg-button" onClick={()=>{cancel();setConnections({});clear();setMessage('Circuit resetat. Conectează cele patru fire.');}}>Refă conexiunile</button>}{drag&&<button className="rpg-button" onClick={cancel}>Anulează firul</button>}<button className="rpg-button" onClick={onClose}>Înapoi în cameră</button></div>
    {!won&&<div className="arduino-removal">{Object.keys(connections).map(pin=><button key={pin} onClick={()=>remove(pin)}>Șterge {pin}</button>)}</div>}
  </div>;
}
