import {useState} from 'react';
import {BookOpen, Coffee} from 'lucide-react';
import DetailDialog from './DetailDialog';
export function DecorRoom({house,onExit}){
 const [detail,setDetail]=useState(null);
 const library=house.id==='library';
 return <section className="interior-room shared-room"><header className="interior-header"><div><p className="eyebrow">UN POPAS ÎN SAT</p><h2>{house.title}</h2></div><button className="rpg-button" onClick={onExit}>Înapoi în oraș</button></header><div className="shared-content"><div className="room-sign">{library?<BookOpen size={70}/>:<Coffee size={70}/>}<h3>{library?'Poveștile stau la raft. Indiciile, printre rânduri.':'O cafea mică, o pauză mare.'}</h3></div><div className="decor-actions"><button className="rpg-button" onClick={()=>setDetail({title:library?'Registrul bibliotecii':'Meniul zilei',text:library?'Patru mecanisme așteaptă amintirile echipei. Privește-le cu atenție: fiecare ascunde un indiciu.':'Espresso: 5 minute de energie. Deadline: energie nelimitată, somn indisponibil.'})}>{library?'Citește registrul':'Citește meniul'}</button><button className="rpg-button" onClick={()=>setDetail({title:library?'Un bilețel între pagini':'Mesaj pe șervețel',text:library?'Adună cele patru fragmente înainte de a intra în temniță. Acolo potrivește-le cu mecanismele și rezolvă cele trei încercări.':'Un coleg a încercat să repare o eroare cu o cafea. Acum are două erori, dar este mai rapid.'})}>{library?'Caută printre pagini':'Ridică șervețelul'}</button></div></div>{detail&&<DetailDialog title={detail.title} onClose={()=>setDetail(null)}><p>{detail.text}</p></DetailDialog>}</section>;
}
export {default as TrapRoom} from '../houses/dungeon/DungeonRoom';
export {default as SecretRoom} from '../houses/dungeon/SecretRoom';
