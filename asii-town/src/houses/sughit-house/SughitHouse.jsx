import {useEffect, useRef, useState} from 'react';
import DetailDialog from '../../components/DetailDialog';
import ObjectImage from '../../components/ObjectImage';
import {assets} from '../../assets';
import {getRoomObjects} from '../roomObjects';
import {drawWorkshop, FURNITURE_TILES} from './workshop';
import BlackjackGame, {Card} from './BlackjackGame';

// PNG-urile adăugate ulterior sunt preluate automat și incluse în build.
const pictures = import.meta.glob('../../assets/sughit-house/*.png', {eager:true, query:'?url', import:'default'});
const PROPS = [
  {file:'medalie-olimpiada.png', x:2, y:2, symbol:'★', color:'#e2bd58'},
  {file:'arduino-ars.png', x:9, y:4, symbol:'UNO', color:'#398c80'},
  {file:'idiotul.png', x:1, y:5, symbol:'ИДИОТ', color:'#985b57'},
  {file:'inserter-factorio.png', x:10, y:6, symbol:'↗', color:'#d79b40'},
  {file:'baner-for-honor.png', x:10, y:2, symbol:'⚔', color:'#6779a5'},
  {id:'blackjack', x:6, y:5, symbol:'A♠', color:'#387154'},
];
const T=48, COLS=13, ROWS=9, W=COLS*T, H=ROWS*T;
const key=p=>`${p.x},${p.y}`;
const DIRECTIONS={ArrowDown:[0,1,2],s:[0,1,2],ArrowLeft:[-1,0,4],a:[-1,0,4],ArrowRight:[1,0,6],d:[1,0,6],ArrowUp:[0,-1,8],w:[0,-1,8]};
const blocked=new Set([...FURNITURE_TILES,...PROPS.map(key)]);
const canWalk=p=>p.x>=0&&p.x<COLS&&p.y>=2&&p.y<ROWS&&!blocked.has(key(p));
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const nearby=p=>PROPS.findIndex(prop=>distance(p,prop)===1);
function pathTo(start, goal) {
  if(!canWalk(goal))return [];
  const queue=[start], parents=new Map([[key(start),null]]);
  for(let i=0;i<queue.length;i++) {
    const p=queue[i];
    if(key(p)===key(goal)) {
      const path=[];
      for(let n=p;parents.get(key(n));n=parents.get(key(n)))path.unshift(n);
      return path;
    }
    for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1]]) {
      const n={x:p.x+dx,y:p.y+dy};
      if(canWalk(n)&&!parents.has(key(n))){parents.set(key(n),p);queue.push(n);}
    }
  }
  return [];
}
const imageFor=prop=>pictures[`../../assets/sughit-house/${prop.file}`];

export default function SughitHouse({member,onExit,onGameWin,progress,Game=BlackjackGame}) {
  const canvas=useRef(null), callbacks=useRef({}), paused=useRef(false);
  const [detail,setDetail]=useState(null),[near,setNear]=useState(-1),[game,setGame]=useState(false);
  const [reward,setReward]=useState(false);
  const rewardPending=useRef(false);
  function winGame(){rewardPending.current=true;onGameWin?.();}
  function closeGame(){setGame(false);if(rewardPending.current){rewardPending.current=false;setReward(true);}}
  const objects=[...getRoomObjects(member).map((object,i)=>({...object,image:imageFor(PROPS[i])})),{id:'blackjack',label:'Masa de blackjack'}];
  callbacks.current={onExit,open:i=>PROPS[i].id==='blackjack'?setGame(true):setDetail(objects[i])};
  paused.current=Boolean(detail||game||reward);

  useEffect(()=>{
    const el=canvas.current,ctx=el.getContext('2d');
    const load=src=>{const img=new Image();img.src=src;return img;};
    const images={actor:load(assets.actor)};
    const props=PROPS.map(prop=>imageFor(prop)?load(imageFor(prop)):null);
    let player={x:6,y:7}, position={x:6.5*T,y:7.5*T}, direction=2, path=[], pending=-1, lastNear=-1;
    let frame, last=0, elapsed=0, animation=0, target=null;
    const keys=new Set();
    function down(e) {
      if(paused.current)return;
      const k=e.key.length===1?e.key.toLowerCase():e.key;
      if(DIRECTIONS[k]){e.preventDefault();keys.add(k);path=[];pending=-1;}
      if((k==='e'||k==='Enter')&&!e.repeat){e.preventDefault();const i=nearby(player);if(i>=0)callbacks.current.open(i);}
    }
    const up=e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key);
    const blur=()=>keys.clear();
    function click(e) {
      if(paused.current)return;
      const rect=el.getBoundingClientRect();
      const tile={x:Math.floor((e.clientX-rect.left)*W/rect.width/T),y:Math.floor((e.clientY-rect.top)*H/rect.height/T)};
      pending=PROPS.findIndex(prop=>key(prop)===key(tile));
      if(pending>=0) {
        if(distance(player,tile)===1&&!target){callbacks.current.open(pending);pending=-1;return;}
        const options=[[0,1],[-1,0],[1,0],[0,-1]].map(([dx,dy])=>pathTo(player,{x:tile.x+dx,y:tile.y+dy})).filter(p=>p.length);
        path=options.sort((a,b)=>a.length-b.length)[0]||[];
      } else path=pathTo(player,tile);
    }
    const draw=(img,x,y,w,h)=>{if(img?.complete&&img.naturalWidth)ctx.drawImage(img,x,y,w,h);};
    function render(time) {
      elapsed+=Math.min(time-(last||time),100);last=time;
      while(elapsed>=1000/60) {
        elapsed-=1000/60;
        if(paused.current){keys.clear();path=[];pending=-1;continue;}
        if(!target) {
          const k=[...keys].at(-1), move=DIRECTIONS[k];
          const next=move?{x:player.x+move[0],y:player.y+move[1]}:path.shift();
          if(next&&canWalk(next)) {
            direction=next.x>player.x?6:next.x<player.x?4:next.y>player.y?2:8;
            player=next;target={x:(next.x+.5)*T,y:(next.y+.5)*T};
          } else if(pending>=0) {
            if(nearby(player)===pending)callbacks.current.open(pending);
            pending=-1;
          }
        }
        if(target) {
          position.x+=Math.sign(target.x-position.x)*Math.min(3,Math.abs(target.x-position.x));
          position.y+=Math.sign(target.y-position.y)*Math.min(3,Math.abs(target.y-position.y));
          animation++;
          if(position.x===target.x&&position.y===target.y) {
            target=null;
            if(player.x===6&&player.y===8){callbacks.current.onExit();return;}
          }
        }
        const n=nearby(player);if(n!==lastNear){lastNear=n;setNear(n);}
      }
      ctx.imageSmoothingEnabled=false;
      drawWorkshop(ctx,time);
      PROPS.forEach((prop,i)=>{
        const x=prop.x*T,y=prop.y*T;
        if(prop.id==='blackjack') {
          ctx.fillStyle='#35281e';ctx.fillRect(x+1,y+4,46,44);
          ctx.fillStyle='#aa874c';ctx.fillRect(x,y,48,44);
          ctx.fillStyle=prop.color;ctx.fillRect(x+3,y+3,42,38);
          ctx.fillStyle='#fff0d0';ctx.fillRect(x+10,y+9,19,26);
          ctx.fillStyle='#162623';ctx.textAlign='center';ctx.font='bold 12px Georgia';ctx.fillText('A♠',x+20,y+27);
          ctx.fillStyle='#b5463d';ctx.fillRect(x+33,y+24,7,7);
        }
        else if(props[i]?.complete&&props[i].naturalWidth)draw(props[i],x+3,y+3,42,42);
        else {
          ctx.fillStyle='#211b18';ctx.fillRect(x+2,y+2,44,44);
          ctx.fillStyle=prop.color;ctx.fillRect(x+5,y+5,38,38);
          ctx.fillStyle='#fff1cf';ctx.textAlign='center';ctx.font='bold 11px Georgia';ctx.fillText(prop.symbol,x+24,y+29);
        }
        if(i===lastNear){ctx.fillStyle='#ffe39a';ctx.beginPath();ctx.arc(x+24,y-5+Math.sin(time/200)*3,4,0,Math.PI*2);ctx.fill();}
      });
      ctx.fillStyle='#211810';ctx.fillRect(6*T,8*T+36,T,12);
      ctx.fillStyle='#ead6aa';ctx.textAlign='center';ctx.font='11px Georgia';ctx.fillText('Ieșire',6.5*T,8*T+31);
      const pattern=target?[0,1,2,1][Math.floor(animation/6)%4]:1;
      if(images.actor.complete&&images.actor.naturalWidth)ctx.drawImage(images.actor,pattern*T,({2:0,4:1,6:2,8:3})[direction]*T,T,T,position.x-24,position.y-42,T,T);
      frame=requestAnimationFrame(render);
    }
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);el.addEventListener('pointerdown',click);
    frame=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);el.removeEventListener('pointerdown',click);};
  },[]);

  return <section className="interior-room personal-room" style={{'--room-accent':member.color}}>
    <header className="interior-header"><div><p className="eyebrow">CAMERĂ PERSONALĂ · {member.name}</p><h2>{member.title}</h2><p>{near>=0?`Apasă E sau Enter: ${objects[near].label}`:'Mergi cu săgețile, WASD sau click. Explorează cele cinci obiecte.'}</p></div><button className="rpg-button" onClick={onExit}>Înapoi în oraș</button></header>
    <div style={{flex:1,minHeight:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#152523',padding:8}}>
      <canvas ref={canvas} width={W} height={H} style={{maxWidth:'100%',maxHeight:'100%',aspectRatio:`${W}/${H}`,imageRendering:'pixelated',touchAction:'none'}} aria-label="Casa alchimistului: săgeți, WASD sau click pentru deplasare; E sau Enter pentru a inspecta obiectele"/>
    </div>
    {detail&&<DetailDialog title={detail.label} onClose={()=>setDetail(null)}><ObjectImage image={detail.image} label={detail.label} className="object-detail-image"/><p>{detail.description}</p></DetailDialog>}
    {game&&<DetailDialog title="Masa de blackjack" onClose={closeGame}><Game completed={progress?.won.includes(member.id)} onWin={winGame} onClose={closeGame}/></DetailDialog>}
    {reward&&<DetailDialog title="Fragment: As de pică" onClose={()=>setReward(false)}><div className="bj-reward"><Card card={{rank:'A',suit:'♠'}}/><span>As de pică · A♠<br/><small>Fragmentul Casei alchimistului</small></span></div><p>Ai câștigat la blackjack! Asul de pică a fost adăugat în inventar. Selectează-l și folosește-l în Casa Capcană.</p><button className="rpg-button" onClick={()=>setReward(false)}>Înapoi în cameră</button></DetailDialog>}
  </section>;
}
