import {useEffect,useRef} from 'react';
import {drawWorld,camera} from '../game/draw';
import {center,closestReachable,doorTile,HOUSES,startingTile,TILE,toTile,isBlocked} from '../game/world';
import {findDirection} from '../game/movement';
let saved={...center(startingTile),direction:2,pattern:1};
export default function World({onEnter,paused=false,targetHouse=null}){
 const canvas=useRef(null),enter=useRef(onEnter),navigate=useRef(null),pause=useRef(paused),goToHouse=useRef(null);enter.current=onEnter;pause.current=paused;
 useEffect(()=>{if(targetHouse)goToHouse.current?.(targetHouse.id);},[targetHouse]);
 useEffect(()=>{
 const el=canvas.current,ctx=el.getContext('2d'),keys=new Set(),p={...saved};let width=0,height=0,destination=null,pending=null,step=null,frame,last=0,acc=0,animation=0,pattern=1,dash=false;
 const resize=()=>{const r=el.getBoundingClientRect();width=r.width;height=r.height;const d=window.devicePixelRatio||1;el.width=Math.round(width*d);el.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);};const observer=new ResizeObserver(resize);observer.observe(el);resize();
 const dirs={s:2,a:4,d:6,w:8,ArrowDown:2,ArrowLeft:4,ArrowRight:6,ArrowUp:8};
 const down=e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(pause.current||e.target.closest?.('button,input,select,textarea,summary'))return;if(e.key==='Enter'||e.key.toLowerCase()==='e'){const t=toTile(p),h=HOUSES.find(h=>{const d=doorTile(h);return Math.abs(t.x-d.x)+Math.abs(t.y-d.y)<=1;});if(h){e.preventDefault();saved={...p};enter.current(h.id);return;}}if(dirs[key]||key==='Shift'){e.preventDefault();keys.add(key);}};const up=e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key);const blur=()=>keys.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
 goToHouse.current=id=>{const h=HOUSES.find(h=>h.id===id);if(h){destination=doorTile(h);pending=h;}};
 navigate.current=e=>{if(pause.current)return;const r=el.getBoundingClientRect(),c=camera(p,width,height),point={x:e.clientX-r.left+c.x,y:e.clientY-r.top+c.y};const h=HOUSES.find(h=>point.x>=h.x*TILE&&point.x<(h.x+h.w)*TILE&&point.y>=h.y*TILE&&point.y<(h.y+h.h+1)*TILE);destination=h?doorTile(h):closestReachable(toTile(point));pending=h||null;};
 const tick=()=>{
 if(pause.current){keys.clear();return;}
 if(!step){const tile=toTile(p),pressed=Object.keys(dirs).reverse().find(k=>keys.has(k));let direction=0;dash=keys.has('Shift')||Boolean(destination);
 if(pressed){destination=null;pending=null;direction=dirs[pressed];
 if(direction===8){const h=HOUSES.find(h=>{const door=doorTile(h);return tile.x===door.x&&tile.y===door.y;});if(h){keys.clear();saved={...p,direction:8};enter.current(h.id);return;}}
 }
 else if(destination){if(tile.x===destination.x&&tile.y===destination.y){destination=null;if(pending){const h=pending;pending=null;saved={...p};enter.current(h.id);return;}}else direction=findDirection(tile,destination.x,destination.y);}
 if(direction){p.direction=direction;const next={x:tile.x+(direction===6?1:direction===4?-1:0),y:tile.y+(direction===2?1:direction===8?-1:0)};if(!isBlocked(next.x,next.y))step=center(next);else{destination=null;pending=null;}}
 }
 if(step){const speed=2**(dash?5:4)/256*TILE,dx=step.x-p.x,dy=step.y-p.y;p.x+=Math.sign(dx)*Math.min(Math.abs(dx),speed);p.y+=Math.sign(dy)*Math.min(Math.abs(dy),speed);animation+=1.5;if(animation>=(9-(dash?5:4))*3){animation=0;pattern=(pattern+1)%4;}p.pattern=pattern===3?1:pattern;if(p.x===step.x&&p.y===step.y)step=null;}else{p.pattern=1;animation=0;pattern=1;}
 };
 const animate=time=>{acc+=Math.min(time-(last||time),100);last=time;while(acc>=1000/60){tick();acc-=1000/60;}drawWorld(ctx,p,destination?center(destination):null,time,width,height);frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);
 return()=>{saved={...p};cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
 },[]);
 return <div className="relative h-full overflow-hidden"><canvas ref={canvas} onPointerDown={e=>navigate.current?.(e)} className="game-canvas" aria-label="Sat: WASD / sageti / click pentru deplasare; W sau sageata sus in fata usii pentru intrare; Enter / E langa usa"/></div>;
}
