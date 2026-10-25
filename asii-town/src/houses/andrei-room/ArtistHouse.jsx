import {useEffect,useRef,useState} from 'react';
import {LockKeyhole} from 'lucide-react';
import DetailDialog from '../../components/DetailDialog';
import ObjectImage from '../../components/ObjectImage';
import {getRoomObjects} from '../roomObjects';
import {assets} from '../../assets';
import AlbumSortingGame from './AlbumSortingGame';
import paintingSrc from '../../assets/andrei-room/pms.jpg';
import bottleSrc from '../../assets/andrei-room/jpg le.png';
import bedSrc from '../../assets/andrei-room/bed.png';
import wardrobeSrc from '../../assets/andrei-room/wardrobe.png';
import desk from '../../assets/andrei-room/briou.png';
import lampa from '../../assets/andrei-room/lampa.png';
import fnaf from '../../assets/andrei-room/fnaf.png';
import stand from '../../assets/andrei-room/stand.png';
//import pcSrc from '../../assets/andrei-room/briou.png';
import bilet from '../../assets/andrei-room/biletel.png';
import mimiSrc from '../../assets/andrei-room/mimi.png';
import ursusSrc from '../../assets/andrei-room/ursus.png';

// Camera artistului: o cameră în care jucătorul se plimbă (săgeți / WASD / click).
// Când ajunge în fața biroului apare automat un mesaj; E / Enter lângă un obiect îl deschide.
const T=48,COLS=13,ROWS=9,W=COLS*T,H=ROWS*T;
const DESK={x:5,y:3,w:3};                       // biroul ocupă (5..7, 3)
const DESK_TRIGGER=[{x:5,y:4},{x:6,y:4},{x:7,y:4}]; // dalele din fața biroului
const EXIT={x:6,y:8};
const START={x:6,y:7};
// Date de interacțiune din fața tabloului (tabloul este desenat pe peretele de sus).
const PAINTING_TRIGGER={x:4,y:2};
const HOTSPOTS=[
 {id:'lamp',x:3.5,y:3,label:'Lampa',message:'Ai aprins lampa. Lumina caldă cade pe podea, iar bilețelul devine vizibil.'},
 {id:'mimi',x:0,y:2,label:'Mimi',message:'Miau! E prea întuneric aici. Aprinde lampa de lângă pat ca să vezi mai bine!'},
 {id:'barrel',x:11,y:6,label:'Butoiul cu rachiu',message:'Rachiu de la College.'},
 {id:'computer',x:6,y:3,label:'Calculatorul',message:'EROARE 303. Colindă la alte uși.'},
 {id:'drawer',x:8,y:4,label:'Sertarul biroului',message:'În sertar găsești albumele răsfoite ale artistului. Sortează-le alfabetic pentru a pune ordine în arhivă.'},
 {id:'costume',x:1,y:7,label:'Costum FNAF',message:'Un costum animatronic stă de pază în colțul camerei.'},
 {id:'bottle',x:9,y:3,label:'Le Male Elixir',message:'Sticla e goală!!! >:('},
 {id:'wardrobe',x:11,y:2,label:'Dulapul',message:'Un dulap mare, numai bun pentru decor.'},
 {id:'painting',x:4,y:2,label:'Tabloul lui PMS',message:'„Coace doamne prunele (din butoi)”'},
 {
  id: 'stand',
  x: 11,
  y: 5,
  label: 'Standul',
  message: 'Interacționează cu toate obiectele din cameră înainte de a începe mini-jocul.'
}
];
// Poziția celor cinci obiecte (în ordinea din content.js) și imaginea lor din tileset.
const PROPS=[
 {x:11,y:6,sprite:[630,52]},
];
const key=(x,y)=>`${x},${y}`;
const blocked=new Set();
for(let x=0;x<COLS;x++){blocked.add(key(x,0));blocked.add(key(x,1));}
for(let x=DESK.x;x<DESK.x+DESK.w;x++)blocked.add(key(x,DESK.y));
PROPS.forEach(p=>blocked.add(key(p.x,p.y)));
// Mobilierul solid: pat, birou, dulap, butoi și noptieră.
for (const [x,y] of [
  [0,2], [2,0],
  [12,2], [13,2],
  [0,6], [1,6],
  [11,7], [12,7]
]) {
  blocked.add(key(x,y));
}
const isBlocked=(x,y)=>x<0||y<0||x>=COLS||y>=ROWS||blocked.has(key(x,y));
const center=t=>({x:(t.x+.5)*T,y:(t.y+.5)*T});
const toTile=p=>({x:Math.floor(p.x/T),y:Math.floor(p.y/T)});
const inDeskZone=t=>DESK_TRIGGER.some(d=>d.x===t.x&&d.y===t.y);
const nearPainting=t=>Math.abs(t.x-PAINTING_TRIGGER.x)+Math.abs(t.y-PAINTING_TRIGGER.y)<=1;
const DIRS={ArrowDown:2,s:2,ArrowLeft:4,a:4,ArrowRight:6,d:6,ArrowUp:8,w:8};
const step=(t,d)=>({x:t.x+(d===6?1:d===4?-1:0),y:t.y+(d===2?1:d===8?-1:0)});

function bfs(start,goal){
 if(isBlocked(goal.x,goal.y))return [];
 const q=[start],par=new Map([[key(start.x,start.y),null]]);
 for(let i=0;i<q.length;i++){const c=q[i];
  if(c.x===goal.x&&c.y===goal.y){const out=[];let a=c;while(a&&!(a.x===start.x&&a.y===start.y)){out.push(a);a=par.get(key(a.x,a.y));}return out.reverse();}
  for(const d of [2,4,6,8]){const n=step(c,d);if(!par.has(key(n.x,n.y))&&!isBlocked(n.x,n.y)){par.set(key(n.x,n.y),c);q.push(n);}}}
 return [];
}
const propAt=t=>PROPS.findIndex(p=>Math.abs(p.x-t.x)+Math.abs(p.y-t.y)===1);

let img=null; // se creează în browser, la prima desenare (nu la import)
const load=src=>{const i=new Image();i.src=src;return i;};
const spr=(ctx,i,sx,sy,sw,sh,x,y,w=T,h=T)=>{if(i.complete&&i.naturalWidth)ctx.drawImage(i,sx,sy,sw,sh,x,y,w,h);};

function drawRoom(ctx,p,labels,time){
 if (!img) {
  img = {
    outside: load(assets.outside),
    ground: load(assets.ground),
    buildings: load(assets.buildings),
    actor: load(assets.actor),
    painting: load(paintingSrc),
    bottle: load(bottleSrc),
    bed: load(bedSrc),
    wardrobe: load(wardrobeSrc),
    desk: load(desk),
    lamp: load(lampa),
    costum: load(fnaf),
    biletel:load(bilet),
    stand:load(stand),
    mimi: load(mimiSrc)
  };
}
 if(typeof window!=='undefined'&&typeof window.__artistLampOn!=='boolean')window.__artistLampOn=false;
 ctx.imageSmoothingEnabled=false;
 // podea din scânduri
 for(let y=2;y<ROWS;y++)for(let x=0;x<COLS;x++)spr(ctx,img.buildings,384,100,48,44,x*T,y*T);
 // perete de cărămidă + plintă
 for(let y=0;y<2;y++)for(let x=0;x<COLS;x++)spr(ctx,img.buildings,198,100,42,44,x*T,y*T);
 ctx.fillStyle='#3a2616';ctx.fillRect(0,2*T-6,W,6);
 // Tabloul PNG este desenat direct pe perete, separat de tileset.
 if(img.painting.complete&&img.painting.naturalWidth){
  const pw=54,ph=42,px=4*T+(T-pw)/2,py=25;
  ctx.fillStyle='#5a3821';ctx.fillRect(px-3,py-3,pw+6,ph+6); // ramă
  ctx.drawImage(img.painting,px,py,pw,ph);
  // Bulina animată în stânga tabloului
  if (
    Math.abs(p.x - (4*T + 8)) < 100 &&
    Math.abs(p.y - 46) < 100
  ) {
    ctx.fillStyle = '#ffe39a';
    ctx.beginPath();
    ctx.arc(
      4*T - 2,
      46 + Math.sin(time / 200) * 3,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
}
 }
  // Bulina animată deasupra biroului, doar când jucătorul se apropie
  if (
    Math.abs(p.x - (DESK.x + DESK.w / 2) * T) < 140 &&
    Math.abs(p.y - DESK.y * T) < 140
  ) {
    ctx.fillStyle = '#ffe39a';
    ctx.beginPath();
    ctx.arc(
      (DESK.x + DESK.w / 2) * T,
      DESK.y * T - 30 + Math.sin(time / 200) * 3,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Standul din partea dreaptă a camerei
  if (img.stand.complete && img.stand.naturalWidth) {
    ctx.drawImage(img.stand, 10.5 * T, 4 * T, 2 * T, 2.5 * T);
  }

  // Bulina standului apare doar când jucătorul se apropie
  if (Math.abs(p.x - 11.5 * T) < 120 &&
      Math.abs(p.y - 5 * T) < 120) {
    ctx.fillStyle = '#ffe39a';
    ctx.beginPath();
    ctx.arc(
      11.5 * T,
      4 * T - 6 + Math.sin(time / 200) * 3,
      5, 0, Math.PI * 2
    );
    ctx.fill();
  }
 // ferestre
 for(const x of [2,6,10])spr(ctx,img.outside,0,576,48,48,x*T,.5*T);
 // covor
 for(let y=4;y<8;y++)for(let x=4;x<9;x++)spr(ctx,img.ground,288,432,48,48,x*T,y*T);
 // Întuneric la intrare; lumina se activează doar după pornirea lămpii.

 // Bilețelul de pe podea.
 if (typeof window !== 'undefined' && window.__artistLampOn) {
  ctx.save();
  ctx.translate(5.1 * T, 6.1 * T);
  ctx.rotate(-0.12);
  ctx.fillStyle = '#e8d29a';
  ctx.fillRect(-22, -16, 44, 32);
  ctx.fillStyle = '#33251b';
  ctx.font = 'bold 8px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Să nu', 0, -4);
  ctx.fillText('mângâi pisica!', 0, 7);
  ctx.restore();
}
 // Pat și Mimi folosesc imaginile din assets.
 if(img.bed.complete&&img.bed.naturalWidth)ctx.drawImage(img.bed,-60, 1.5*T,3.8*T,2.5*T);
 if (img.mimi.complete && img.mimi.naturalWidth) {
  ctx.drawImage(img.mimi, 8, 2*T+12, 42, 34);

  if (Math.abs(p.x - 29) < 65 && Math.abs(p.y - (2*T+29)) < 65) {
    ctx.fillStyle = '#ffe39a';
    ctx.beginPath();
    ctx.arc(29, 2*T+2 + Math.sin(time/200)*3, 5, 0, Math.PI*2);
    ctx.fill();
  }
}
 // Lampă lângă pat
if (img.lamp.complete && img.lamp.naturalWidth) {
  ctx.drawImage(img.lamp, 3.5*T, 1*T, 150, 200);
}
// Bulina animată când jucătorul se apropie de lampă
if (Math.abs(p.x - 216) < 120 && Math.abs(p.y - 120) < 120) {
  ctx.fillStyle = '#ffe39a';
  ctx.beginPath();
  ctx.arc(250, 100 + Math.sin(time / 200) * 3, 5, 0, Math.PI * 2);
  ctx.fill();
}
 // Butoiul cu rachiu în colțul din dreapta jos.
 ctx.fillStyle='#794522';ctx.fillRect(11*T+3,6*T+4,42,52);ctx.fillStyle='#a56a36';ctx.fillRect(11*T+6,6*T+8,36,44);ctx.fillStyle='#5b3924';ctx.fillRect(11*T+2,6*T+12,44,5);ctx.fillRect(11*T+2,6*T+42,44,5);
 // Dulap decorativ din asset.
 if(img.wardrobe.complete&&img.wardrobe.naturalWidth)ctx.drawImage(img.wardrobe,10.5*T,0.3*T,3.9*T, 3*T);
 // Costum FNAF în colțul stânga-jos.
// Al doilea costum FNAF, în partea stângă
if (img.costum.complete && img.costum.naturalWidth) {
  ctx.drawImage(
    img.costum,
    0,
    5 * T,
    130,
    96
  );
}
 // Flacon Le Male Elixir răsturnat pe podea.
if (img.bottle?.complete && img.bottle.naturalWidth) {
  ctx.save();
  ctx.translate(9*T+24, 3*T+18);
  ctx.rotate(-0.35);
  ctx.drawImage(img.bottle, -38, -19, 76, 38);
  ctx.restore();
  // Bulina animată deasupra sticlei
  if (Math.abs(p.x - (9*T + 24)) < 100 &&
    Math.abs(p.y - (3*T + 18)) < 100) {
  ctx.fillStyle = '#ffe39a';
  ctx.beginPath();
  ctx.arc(9*T + 24, 3*T - 4 + Math.sin(time / 200) * 3, 5, 0, Math.PI * 2);
  ctx.fill();
  }
}
 ctx.strokeStyle='#4a2418';ctx.lineWidth=3;ctx.strokeRect(4*T+1.5,4*T+1.5,5*T-3,4*T-3);
 // ieșire
 ctx.fillStyle='#2b1d12';ctx.fillRect(EXIT.x*T,EXIT.y*T+T-10,T,10);
 ctx.fillStyle='#e4cf9a';ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillText('Ieșire',(EXIT.x+.5)*T,EXIT.y*T+T-14);
 const actors=[];
 // obiecte
 PROPS.forEach((pr,i)=>actors.push({y:(pr.y+1)*T,draw:()=>{
  ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse((pr.x+.5)*T,(pr.y+.9)*T,16,6,0,0,7);ctx.fill();
  spr(ctx,img.outside,pr.sprite[0],pr.sprite[1],48,48,pr.x*T,pr.y*T);
  if(labels===i){ctx.fillStyle='#ffe39a';ctx.beginPath();ctx.arc((pr.x+.5)*T,pr.y*T-4+Math.sin(time/200)*2,4,0,7);ctx.fill();}
 }}));
 // birou
 // Birou din imaginea desk
actors.push({
  y: (DESK.y + 1) * T,
  draw: () => {
    if (img.desk.complete && img.desk.naturalWidth) {
      ctx.drawImage(
        img.desk,
        DESK.x * T - 12,
        DESK.y * T - 25,
        DESK.w * T + 50,
        2 * T
      );
    }
  }
});
 // jucător
 actors.push({y:p.y,draw:()=>{ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(p.x,p.y+2,15,6,0,0,7);ctx.fill();
  spr(ctx,img.actor,(p.pattern??1)*48,({2:0,4:1,6:2,8:3})[p.direction||2]*48,48,48,p.x-24,p.y-42);}});
 actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
 // Întuneric peste toată camera până când jucătorul aprinde lampa.
 if(typeof window==='undefined'||!window.__artistLampOn){ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);} else {const g=ctx.createRadialGradient(2*T+20,4*T,12,2*T+20,4*T,210);g.addColorStop(0,'rgba(255,218,130,0.24)');g.addColorStop(1,'rgba(255,218,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
}

export default function ArtistHouse({member,progress,dispatch,onExit,notify,selectedItem,Game,onGameWin}){
 const canvas=useRef(null),pausedRef=useRef(false),exitRef=useRef(onExit),openRef=useRef(null);
 const [detail,setDetail]=useState(null),[deskOpen,setDeskOpen]=useState(false),[game,setGame]=useState(false),[ursusReward,setUrsusReward]=useState(false),[visited,setVisited]=useState([]),[near,setNear]=useState(-1),[paintingOpen,setPaintingOpen]=useState(false),[paintingNearby,setPaintingNearby]=useState(false),[activeHotspot,setActiveHotspot]=useState(null),[lampOn,setLampOn]=useState(false);
 const objects = getRoomObjects(member);
 const won=progress.won.includes(member.id);
 const requiredInteractions = [
  'lamp', 'mimi', 'barrel', 'computer', 'bottle', 'painting'
];

const allObjectsVisited = requiredInteractions.every(
  id => visited.includes(id)
);
 exitRef.current=onExit;pausedRef.current=Boolean(detail||deskOpen||game||paintingOpen||activeHotspot);
 openRef.current=i=>setDetail(objects[i]);
 const deskTriggered=useRef(false),objectsRef=useRef(objects);objectsRef.current=objects;
 const visitedRef = useRef(new Set());

 function markVisited(id) {
  if (id === 'stand') return;
  visitedRef.current.add(id);
  setVisited([...visitedRef.current]);
}
 useEffect(()=>{
  const el=canvas.current,ctx=el.getContext('2d');
  el.width=W;el.height=H;
  const p={...center(START),direction:8,pattern:1};
  let keys=[],stepTo=null,path=[],pendingProp=-1,anim=0,pat=1,frame,last=0,acc=0,lastNear=-1;
  const down=e=>{
   if(pausedRef.current||e.target.closest?.('button,input,select,textarea'))return;
   const k=e.key.length===1?e.key.toLowerCase():e.key;
if (k === 'e' || k === 'Enter') {
  const tile = toTile(p);
  const hot = HOTSPOTS
  .map(h => ({
    ...h,
    distance:
      Math.abs(h.x - tile.x) + Math.abs(h.y - tile.y)
  }))
  .filter(h => h.distance <= 1)
  .sort((a, b) => a.distance - b.distance)[0];

  if (hot) {
  e.preventDefault();
  markVisited(hot.id);

  if (hot.id === 'lamp') {
    setLampOn(v => {
      window.__artistLampOn = !v;
      return !v;
    });
    setActiveHotspot({
      id: 'lamp',
      title: 'Lampă',
      message: lampOn ? 'Ai stins lampa.' : 'Ai aprins lampa.'
    });
  }  else if (hot.id === 'stand') {
  const allVisited = requiredInteractions.every(
    id => visitedRef.current.has(id)
  );

  if (allVisited && Game) {
    setActiveHotspot(null);
    setPaintingOpen(false);
    setDeskOpen(false);
    setGame(true);
  } else {
    setActiveHotspot({
      id: 'stand',
      title: 'Standul',
      message: allVisited
        ? 'Mini-jocul nu este încă disponibil.'
        : 'Inspectează Mimi, lampa, tabloul, biroul, parfumul și butoiul înainte să începi mini-jocul.'
    });
  } }else if (hot.id === 'computer' || hot.id === 'drawer') {
    setActiveHotspot({
      id: hot.id,
      title: hot.id === 'computer' ? 'Calculatorul' : 'Biroul',
      message: 'EROARE 303. Colindă la alte uși.'
    });
  } else if (hot.id === 'painting') {
    setPaintingOpen(true);
  } else {
    setActiveHotspot(hot);
  }

  return;
}

  if (nearPainting(tile)) {
    e.preventDefault();
    markVisited('painting');
    setPaintingOpen(true);
    return;
  }

  const i = propAt(tile);
  if (i >= 0) {
    e.preventDefault();
    openRef.current(i);
  }
  return;
}
   if(DIRS[k]){e.preventDefault();path=[];pendingProp=-1;if(!keys.includes(k))keys.push(k);}
  };
  const up=e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys=keys.filter(x=>x!==k);};
  const blur=()=>{keys=[];};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  const click=e=>{
   if(pausedRef.current)return;
   const r=el.getBoundingClientRect(),s=Math.min(r.width/W,r.height/H),ox=(r.width-W*s)/2,oy=(r.height-H*s)/2;
   const t={x:Math.floor((e.clientX-r.left-ox)/s/T),y:Math.floor((e.clientY-r.top-oy)/s/T)};
   const pi=PROPS.findIndex(q=>q.x===t.x&&q.y===t.y);
   const hot=HOTSPOTS.find(h=>h.x===t.x&&h.y===t.y);
 if (hot) {
  markVisited(hot.id);

  if (hot.id === 'lamp') {
    setLampOn(v => {
      window.__artistLampOn = !v;
      return !v;
    });

    setActiveHotspot({
      id: 'lamp',
      title: 'Lampă',
      message: lampOn ? 'Ai stins lampa.' : 'Ai aprins lampa.'
    });

  } else if (hot.id === 'stand') {
    const allVisited = requiredInteractions.every(
      id => visitedRef.current.has(id)
    );

    if (allVisited && Game) {
      setActiveHotspot(null);
      setPaintingOpen(false);
      setDeskOpen(false);
      setGame(true);
    } else {
      setActiveHotspot({
        id: 'stand',
        title: 'Standul',
        message: allVisited
          ? 'Mini-jocul nu este încă disponibil.'
          : 'Inspectează Mimi, lampa, tabloul, biroul, parfumul și butoiul înainte să începi mini-jocul.'
      });
    }

  } else if (hot.id === 'computer' || hot.id === 'drawer') {
    setActiveHotspot({
      id: hot.id,
      title: hot.id === 'computer' ? 'Calculatorul' : 'Biroul',
      message: 'EROARE 303. Colindă la alte uși.'
    });

  } else if (hot.id === 'painting') {
    setPaintingOpen(true);

  } else {
    setActiveHotspot(hot);
  }

  return;
}
   const from=toTile(p);
   if(pi>=0){ // mergem lângă obiect, apoi îl deschidem
    if(propAt(from)===pi){openRef.current(pi);return;}
    const cands=[2,4,6,8].map(d=>step(PROPS[pi],d)).filter(n=>!isBlocked(n.x,n.y)).map(n=>bfs(from,n)).filter(pp=>pp.length||false);
    const best=cands.sort((a,b)=>a.length-b.length)[0];
    if(best){path=best;pendingProp=pi;}
    return;
   }
   path=bfs(from,t);pendingProp=-1;
  };
  el.addEventListener('pointerdown',click);
  const tick=()=>{
   if(pausedRef.current){keys=[];path=[];return;}
   if(!stepTo){
    const tile=toTile(p);let d=0;
    if(keys.length)d=DIRS[keys[keys.length-1]];
    else if(path.length){const n=path[0];if(n.x===tile.x&&n.y===tile.y)path.shift();const m=path[0];if(m)d=m.x>tile.x?6:m.x<tile.x?4:m.y>tile.y?2:8;}
    if(d){p.direction=d;const n=step(tile,d);if(!isBlocked(n.x,n.y)){stepTo=center(n);if(path.length&&path[0].x===n.x&&path[0].y===n.y)path.shift();}else path=[];}
    else if(pendingProp>=0){const i=pendingProp;pendingProp=-1;if(propAt(tile)===i)openRef.current(i);}
    // ieșire: pas pe covorașul din ușă
    if(tile.x===EXIT.x&&tile.y===EXIT.y){exitRef.current();return;}
    // mesajul de la birou
    deskTriggered.current = inDeskZone(tile);
    const n=propAt(tile);if(n!==lastNear){lastNear=n;setNear(n);}
    const canSeePainting=nearPainting(tile);setPaintingNearby(old=>old===canSeePainting?old:canSeePainting);
   }
   if(stepTo){const sp=3,dx=stepTo.x-p.x,dy=stepTo.y-p.y;p.x+=Math.sign(dx)*Math.min(Math.abs(dx),sp);p.y+=Math.sign(dy)*Math.min(Math.abs(dy),sp);anim++;if(anim>=5){anim=0;pat=(pat+1)%4;}p.pattern=pat===3?1:pat;if(p.x===stepTo.x&&p.y===stepTo.y)stepTo=null;}
   else{p.pattern=1;anim=0;pat=1;}
  };
  const loop=time=>{acc+=Math.min(time-(last||time),100);last=time;while(acc>=1000/60){tick();acc-=1000/60;}drawRoom(ctx,p,lastNear,time);frame=requestAnimationFrame(loop);};
  frame=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);el.removeEventListener('pointerdown',click);};
 },[]);

 function win(){
  onGameWin();
  if (dispatch) dispatch({type:'collect', id:'ursus:artist'});
  setGame(false);
  setUrsusReward(true);
  notify('Ai completat mini-jocul și ai primit o sticlă Ursus! O găsești în inventar.');
 }
 return <section className="interior-room personal-room" style={{'--room-accent':member.color}}>
  <header className="interior-header"><div><p className="eyebrow">CAMERĂ PERSONALĂ · {member.name}</p><h2>{member.title}</h2><p>{paintingNearby?'Apasă E sau Enter pentru a privi tabloul.':near>=0?`Apasă E sau Enter: ${objects[near]?.label}`:'Mergi cu săgețile sau click. Explorează camera.'}</p></div>
   <div style={{display:'flex',gap:8}}>
    <button className="rpg-button" disabled={won || !allObjectsVisited} onClick={()=>{if(allObjectsVisited&&Game)setGame(true);else if(!allObjectsVisited)notify('Inspectează Mimi, lampa, tabloul, biroul, parfumul și butoiul înainte să începi mini-jocul.');}}><LockKeyhole size={16}/>{won?'Mini-joc câștigat':'Mini-joc'}</button>
    <button className="rpg-button" onClick={onExit}>Înapoi în oraș</button>
   </div></header>
  <div style={{flex:1,minHeight:0,position:'relative',background:'#2a2018'}}>
   <canvas ref={canvas} style={{position:'absolute',inset:8,width:'calc(100% - 16px)',height:'calc(100% - 16px)',objectFit:'contain',imageRendering:'pixelated',touchAction:'none'}} aria-label="Camera artistului: săgeți sau click pentru deplasare, E lângă un obiect pentru a-l inspecta"/>
  </div>
  {activeHotspot&&<DetailDialog title={activeHotspot.title||activeHotspot.label} onClose={()=>setActiveHotspot(null)}>{activeHotspot.id==='barrel'&&<div style={{fontSize:56,textAlign:'center'}} aria-label="Pahar cu rachiu">🥃</div>}{activeHotspot.id==='mimi'&&<div style={{fontSize:56,textAlign:'center'}} aria-label="Mimi, pisica">🐈</div>}{activeHotspot.id==='computer'&&<div style={{background:'#17151c',color:'#ff5b4d',padding:24,textAlign:'center',fontWeight:700,fontSize:22}}>⚠ EROARE 303</div>}{activeHotspot.id==='costume'&&<div style={{fontSize:56,textAlign:'center'}}>🐻</div>}{activeHotspot.id==='bottle'&& (<img
    src={bottleSrc}
    alt="Jean Paul Gaultier Le Male Elixir"
    style={{
      display: 'block',
      width: '280px',
      maxWidth: '100%',
      height: '280px',
      objectFit: 'contain',
      margin: '0 auto'
    }}
  />
)}<p>{activeHotspot.message}</p>{activeHotspot.id==='painting'&&<p>Portretul lui Petrică Mâțu Stoian are un bilețel lipit de ramă: „Coace doamne prunele (din butoi)”.</p>}{activeHotspot.id==='mimi'&&<p>De ce nu citesti biletelele random de pe podele? {'>'}:)</p>}</DetailDialog>}
  {game && Game && <DetailDialog title="Provocarea camerei" onClose={() => setGame(false)}>
    <Game
      member={member}
      progress={progress}
      onWin={win}
      onClose={() => setGame(false)}
      inventory={progress.inventory}
      selectedItem={selectedItem}
      notify={notify}
    />
  </DetailDialog>}
  {ursusReward&&<DetailDialog title="Recompensă: Ursus" onClose={()=>setUrsusReward(false)}><img src={ursusSrc} alt="Sticlă Ursus" style={{display:'block',width:240,maxWidth:'100%',maxHeight:'55vh',objectFit:'contain',margin:'0 auto'}}/><p>Felicitări! Ai primit o sticlă Ursus. Am adăugat-o în inventar.</p><button className="rpg-button" onClick={()=>setUrsusReward(false)}>Continuă</button></DetailDialog>}
  {paintingOpen&&<DetailDialog title="Coace doamne pruneleee" onClose={()=>setPaintingOpen(false)}><img src={paintingSrc} alt="Tabloul de pe peretele camerei artistului" style={{display:'block',width:'100%',maxWidth:720,maxHeight:'75vh',objectFit:'contain',margin:'0 auto'}}/><p>Apasă butonul de închidere pentru a reveni în cameră.</p></DetailDialog>}
  {detail&&<DetailDialog title={detail.label} onClose={()=>setDetail(null)}><ObjectImage image={detail.image} label={detail.label} className="object-detail-image"/><p>{detail.description}</p></DetailDialog>}
 </section>;
}
