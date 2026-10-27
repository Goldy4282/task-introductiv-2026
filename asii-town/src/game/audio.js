import {useEffect,useRef,useState} from 'react';
import town from '../assets/audio/Town3.ogg';
import decision from '../assets/audio/Decision2.ogg';
import cursor from '../assets/audio/Cursor3.ogg';
import chest from '../assets/audio/Chest1.ogg';
import cancel from '../assets/audio/Cancel2.ogg';
import buzzer from '../assets/audio/Buzzer1.ogg';

const sources={decision,cursor,chest,cancel,buzzer};
let muted=false;
const effects=new Map();
export function playSound(name){
 if(muted||!sources[name])return;
 let sound=effects.get(name);
 if(!sound){sound=new Audio(sources[name]);sound.volume=0.4;effects.set(name,sound);}
 sound.currentTime=0;
 sound.play().catch(()=>{});
}

export function useGameAudio(progress){
 const [enabled,setEnabled]=useState(true),music=useRef(null),previous=useRef(progress);
 useEffect(()=>{
  const track=new Audio(town);track.loop=true;track.volume=0.18;music.current=track;
  const start=()=>{if(!muted&&!document.hidden)track.play().catch(()=>{});};
  const visibility=()=>{if(document.hidden)track.pause();else start();};
  const click=e=>{if(e.target.closest?.('button:not(:disabled),summary'))playSound('cursor');};
  window.addEventListener('pointerdown',start);window.addEventListener('keydown',start);
  document.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);
  return()=>{track.pause();music.current=null;effects.forEach(sound=>sound.pause());window.removeEventListener('pointerdown',start);window.removeEventListener('keydown',start);document.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  const before=previous.current;previous.current=progress;
  if(progress.won.length>before.won.length||progress.inventory.length>before.inventory.length||progress.trapGames.length>before.trapGames.length||(!before.secretSubmitted&&progress.secretSubmitted))playSound('chest');
  else if(progress.trapSlots.length>before.trapSlots.length)playSound('decision');
  else if(progress.room!==before.room)playSound(progress.room==='trap'?'buzzer':progress.room?'decision':'cancel');
 },[progress]);
 function toggleSound(){
  const next=!enabled;muted=!next;setEnabled(next);
  if(next&&!document.hidden)music.current?.play().catch(()=>{});
  else{music.current?.pause();effects.forEach(sound=>sound.pause());}
 }
 return {enabled,toggleSound};
}
