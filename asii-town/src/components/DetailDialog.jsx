import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
export default function DetailDialog({title,onClose,children}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;el.showModal();return()=>el.close();},[]);
 return createPortal(<dialog ref={ref} className="object-modal" aria-labelledby="detail-title" onCancel={onClose}><button autoFocus className="modal-close rpg-button" aria-label="Închide" onClick={onClose}><X size={16}/></button><p className="eyebrow">O POVESTE MAI APROAPE</p><h2 id="detail-title">{title}</h2>{children}</dialog>,document.body);
}
