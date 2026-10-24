import {MEMBERS} from '../houses/content';
// v3 deliberately starts without the victories granted by the removed demo games.
export const STORAGE='asii-town-adventure-v3';
export const initialProgress={room:null,visited:[],won:[],inventory:[],hints:0,escaped:false,secretAnswers:{},secretSubmitted:false};
export function canOpenSecret(p){return MEMBERS.every(m=>p.won.includes(m.id))&&p.escaped;}
export function progressReducer(p,a){
 switch(a.type){
 case 'visit':if((p.room==='trap'&&!p.escaped)||(a.id==='secret'&&!canOpenSecret(p))||(a.id==='trap'&&!MEMBERS.every(m=>p.won.includes(m.id))))return p;return {...p,room:a.id,visited:[...new Set([...p.visited,a.id])]};
 case 'exit':return p.room==='trap'&&!p.escaped?p:{...p,room:null};
 case 'collect':return p.inventory.includes(a.id)?p:{...p,inventory:[...p.inventory,a.id]};
 case 'win':if(!MEMBERS.some(m=>m.id===a.id)||p.won.includes(a.id))return p;return {...p,won:[...p.won,a.id],inventory:[...new Set([...p.inventory,'fragment:'+a.id])]};
 case 'hint':return p.hints>=3?p:{...p,hints:p.hints+1};
 case 'escape':if(p.room!=='trap'||p.escaped||!MEMBERS.every(m=>p.won.includes(m.id)))return p;return {...p,escaped:true,inventory:[...new Set([...p.inventory,'fragment:final'])]};
 case 'attribute':return !canOpenSecret(p)||p.secretSubmitted?p:{...p,secretAnswers:{...p.secretAnswers,[a.id]:a.owner}};
 case 'submit':return canOpenSecret(p)&&MEMBERS.every(m=>[0,1].every(i=>p.secretAnswers[m.id+':'+i]))?{...p,secretSubmitted:true}:p;
 default:return p;
 }
}
export function loadProgress(){try{
 const raw=JSON.parse(localStorage.getItem(STORAGE));if(!raw||typeof raw!=='object')return initialProgress;
 const won=Array.isArray(raw.won)?MEMBERS.filter(m=>raw.won.includes(m.id)).map(m=>m.id):[];
 const escaped=won.length===MEMBERS.length&&raw.escaped===true;
 const inventory=Array.isArray(raw.inventory)?raw.inventory.filter(x=>typeof x==='string'):[];
 return {...initialProgress,room:raw.room==='trap'&&!escaped&&won.length===MEMBERS.length?'trap':null,visited:Array.isArray(raw.visited)?raw.visited.filter(x=>typeof x==='string'):[],won,inventory:[...new Set([...inventory,...won.map(id=>'fragment:'+id),...(escaped?['fragment:final']:[])])],hints:Number.isInteger(raw.hints)?Math.max(0,Math.min(3,raw.hints)):0,escaped,secretAnswers:raw.secretAnswers&&typeof raw.secretAnswers==='object'&&!Array.isArray(raw.secretAnswers)?raw.secretAnswers:{},secretSubmitted:Boolean(raw.secretSubmitted)&&escaped};
 }catch{return initialProgress;}}
