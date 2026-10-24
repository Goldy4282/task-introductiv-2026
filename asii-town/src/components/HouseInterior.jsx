import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
function Sprite({item,className=''}){const i=item.image;return <svg className={`pixel ${className}`} viewBox={`${i.x} ${i.y} ${i.w} ${i.h}`} role="img" aria-label={item.label}><image href={i.src} width={i.sheetWidth??768} height={i.sheetHeight??768}/></svg>;}
function Modal({item,onClose}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;el.showModal();return()=>el.close();},[]);
 return createPortal(<dialog ref={ref} className="object-modal" aria-labelledby="object-title" aria-describedby="object-description" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><button autoFocus className="modal-close" aria-label="Închide" onClick={onClose}>X</button><Sprite item={item} className="modal-image"/><h3 id="object-title" className="my-3 text-2xl font-bold">{item.label}</h3><p id="object-description">{item.description}</p></dialog>,document.body);
}
// Objects: {id,x,y,w,h,label,description,image:{src,x,y,w,h}}.
export default function HouseInterior({title,owner,description,objects=[],onExit}){
 const [selected,setSelected]=useState(null);
 return <div className="interior-room"><header className="interior-header"><div><p className="text-xs">INTERIOR / {owner}</p><h2 className="text-xl font-bold">{title}</h2><p className="text-xs">{description}</p></div><button className="rpg-button" onClick={onExit}>Înapoi în oraș</button></header><div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5"><div className="room-floor relative aspect-[1.55] w-full max-w-[980px] overflow-hidden rounded-xl border-[12px] border-[#513c31] bg-[#bb9267]"><div className="absolute inset-x-0 top-0 h-[26%] border-b-8 border-[#674d3c] bg-[#8caa95]"/>{objects.map(item=><button key={item.id} className="interior-item" style={{left:`${item.x}%`,top:`${item.y}%`,width:`${item.w}%`,height:`${item.h}%`}} onClick={()=>setSelected(item)}><Sprite item={item} className="h-[70%] w-full"/><span>{item.label}</span></button>)}</div></div>{selected&&<Modal item={selected} onClose={()=>setSelected(null)}/>}</div>;
}
