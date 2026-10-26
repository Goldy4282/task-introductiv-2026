import {useState} from 'react';
import {Trophy,Compass,Map,Backpack} from 'lucide-react';
import {MEMBERS} from '../content';
import {SECRET_ITEMS} from './logic';
import DetailDialog from '../../components/DetailDialog';
import ObjectImage from '../../components/ObjectImage';
import {objectImages} from '../../assets';
import medal from '../../assets/sughit-house/medalie-olimpiada.png';
import board from '../../assets/sughit-house/arduino-ars.png';
import book from '../../assets/sughit-house/idiotul.png';
import painting from '../../assets/andrei-room/pms.jpg';
import './dungeon.css';
const roomImage=`${import.meta.env.BASE_URL}mihai/cosmic-room.png`;
const images={'maker:0':{src:roomImage,x:96,y:198,w:288,h:414,sheetWidth:1600,sheetHeight:900},'maker:1':{src:roomImage,x:400,y:261,w:240,h:252,sheetWidth:1600,sheetHeight:900},'reader:0':medal,'reader:1':board,'reader:2':book,'artist:0':objectImages.barrel,'artist:1':painting};
const icons={'guest:0':Compass,'guest:1':Map,'guest:2':Backpack};
const order=[5,0,8,3,6,1,9,4,2,7];
export default function SecretRoom({progress,dispatch,onExit}){
  const [selected,setSelected]=useState(null),[checked,setChecked]=useState(false);
  const items=order.map(i=>({...SECRET_ITEMS[i],image:images[SECRET_ITEMS[i].id]||SECRET_ITEMS[i].image}));
  const answered=items.filter(i=>progress.secretAnswers[i.id]).length;
  const score=items.filter(i=>progress.secretAnswers[i.id]===i.owner).length;
  return <section className="interior-room shared-room secret-room"><header className="interior-header"><div><p className="eyebrow">DINCOLO DE UȘA ÎNCUIATĂ</p><h2>Casa Secretă</h2><p>Zece obiecte. Patru povești. Recunoști cui îi aparțin?</p></div><button className="rpg-button" onClick={onExit}>Înapoi în oraș</button></header><div className="shared-content dg-secret-content"><div className="replica-grid">{items.map(item=><article className="replica" key={item.id}><button className="replica-inspect" onClick={()=>setSelected(item)}>{item.image?<ObjectImage image={item.image} label={item.label}/>:<span className="dg-replica-symbol" aria-hidden="true">{(() => {const Icon=icons[item.id]||Compass;return <Icon size={50}/>;})()}</span>}<strong>{item.label}</strong><small>Inspectează</small></button><label><span className="sr-only">Proprietar pentru {item.label}</span><select disabled={progress.secretSubmitted} value={progress.secretAnswers[item.id]||''} onChange={e=>{dispatch({type:'attribute',id:item.id,owner:e.target.value});setChecked(false);}}><option value="">Alege colegul</option>{MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>{checked&&!progress.secretSubmitted&&<small className={progress.secretAnswers[item.id]===item.owner?'correct-answer':'wrong-answer'}>{progress.secretAnswers[item.id]===item.owner?'Corect':'Mai încearcă'}</small>}</article>)}</div><button className="rpg-button" disabled={answered!==10||progress.secretSubmitted} onClick={()=>{setChecked(true);dispatch({type:'submit'});}}>Verifică atribuirea · {answered}/10</button>{checked&&!progress.secretSubmitted&&<p role="status">{score}/10 corecte. Poți corecta răspunsurile și verifica din nou.</p>}</div>
    {selected&&<DetailDialog title={selected.label} onClose={()=>setSelected(null)}>{selected.image&&<ObjectImage image={selected.image} label={selected.label} className="object-detail-image"/>}<p>{selected.description}</p></DetailDialog>}
    {progress.secretSubmitted&&<div className="dg-victory" role="dialog" aria-modal="true" aria-labelledby="game-won"><Trophy size={80}/><h1 id="game-won">Ai câștigat!</h1><p>Ai evadat din temniță și ai recunoscut toate cele 10 obiecte.</p><button className="rpg-button" autoFocus onClick={onExit}>Înapoi în sat</button></div>}
  </section>;
}
