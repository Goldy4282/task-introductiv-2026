import {MEMBERS} from '../houses/content';
import {GATES,verifyCircuit} from '../houses/dragos-room/halfAdderLogic.mjs';
import {GAME_IDS,SECRET_ITEMS,hasFragments,mechanismsReady,gamesReady,validGame,secretCorrect} from '../houses/dungeon/logic';
// v3 deliberately starts without the victories granted by the removed demo games.
export const STORAGE='asii-town-adventure-v3';
export const initialLabCircuit={sum:null,carry:null,a:0,b:0};
export function normalizeLabCircuit(value){
 const v=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 return {sum:GATES.includes(v.sum)?v.sum:null,carry:GATES.includes(v.carry)?v.carry:null,a:v.a===1?1:0,b:v.b===1?1:0};
}
export const initialProgress={labCircuit:{...initialLabCircuit},room:null,visited:[],won:[],inventory:[],hints:0,escaped:false,trapSlots:[],trapGames:[],secretAnswers:{},secretSubmitted:false};
// Salvarile vechi pot conține atât tokenul Ursus, cât și fragmentul aceleiași camere.
export const normalizeInventory=items=>[...new Set(items.map(id=>id==='ursus:artist'?'fragment:artist':id))];
export function canOpenSecret(p){return hasFragments(p)&&p.escaped&&p.inventory.includes('key:secret');}
export function progressReducer(p,a){
 switch(a.type){
 case 'visit':if((p.room==='trap'&&!p.escaped)||(a.id==='secret'&&!canOpenSecret(p))||(a.id==='trap'&&!hasFragments(p)))return p;return {...p,room:a.id,visited:[...new Set([...p.visited,a.id])]};
 case 'exit':return p.room==='trap'&&!p.escaped?p:{...p,room:null};
 case 'collect':return p.inventory.includes(a.id)?p:{...p,inventory:[...p.inventory,a.id]};
 case 'labPlace':if(p.won.includes('guest')||!['sum','carry'].includes(a.slot)||!GATES.includes(a.gate))return p;return {...p,labCircuit:{...normalizeLabCircuit(p.labCircuit),[a.slot]:a.gate}};
 case 'labInputs':if(![0,1].includes(a.a)||![0,1].includes(a.b))return p;return {...p,labCircuit:{...normalizeLabCircuit(p.labCircuit),a:a.a,b:a.b}};
 case 'labReset':if(p.won.includes('guest'))return p;return {...p,labCircuit:{...initialLabCircuit}};
 case 'win':if(!MEMBERS.some(m=>m.id===a.id)||p.won.includes(a.id))return p;return {...p,won:[...p.won,a.id],inventory:normalizeInventory([...p.inventory,'fragment:'+a.id]),labCircuit:a.id==='guest'&&!verifyCircuit(normalizeLabCircuit(p.labCircuit)).passed?{...normalizeLabCircuit(p.labCircuit),sum:'XOR',carry:'AND'}:p.labCircuit};
 case 'hint':return p.hints>=3?p:{...p,hints:p.hints+1};
 case 'trapInsert':if(p.room!=='trap'||!hasFragments(p)||!MEMBERS.some(m=>m.id===a.id)||a.item!=='fragment:'+a.id||p.trapSlots.includes(a.id))return p;return {...p,trapSlots:[...p.trapSlots,a.id]};
 case 'trapSolve':if(p.room!=='trap'||!mechanismsReady(p)||!hasFragments(p)||p.trapGames.includes(a.id)||!validGame(a.id,a.data))return p;return {...p,trapGames:[...p.trapGames,a.id]};
 case 'escape':if(p.room!=='trap'||p.escaped||!hasFragments(p)||!mechanismsReady(p)||!gamesReady(p))return p;return {...p,escaped:true,inventory:[...new Set([...p.inventory,'key:secret'])]};
 case 'attribute':return p.room!=='secret'||!canOpenSecret(p)||p.secretSubmitted||!SECRET_ITEMS.some(i=>i.id===a.id)||!MEMBERS.some(m=>m.id===a.owner)?p:{...p,secretAnswers:{...p.secretAnswers,[a.id]:a.owner}};
 case 'submit':return p.room==='secret'&&canOpenSecret(p)&&secretCorrect(p)?{...p,secretSubmitted:true}:p;
 default:return p;
 }
}
export function loadProgress(){try{
 const raw=JSON.parse(localStorage.getItem(STORAGE));if(!raw||typeof raw!=='object')return initialProgress;
 const won=Array.isArray(raw.won)?MEMBERS.filter(m=>raw.won.includes(m.id)).map(m=>m.id):[];
 const inventory=Array.isArray(raw.inventory)?normalizeInventory(raw.inventory.filter(x=>typeof x==='string')):[];
 const trapSlots=Array.isArray(raw.trapSlots)?MEMBERS.filter(m=>raw.trapSlots.includes(m.id)).map(m=>m.id):[];
 const trapGames=Array.isArray(raw.trapGames)?GAME_IDS.filter(id=>raw.trapGames.includes(id)):[];
 const restoredLab=normalizeLabCircuit(raw.labCircuit);
 const labCircuit=won.includes('guest')&&!verifyCircuit(restoredLab).passed?{...restoredLab,sum:'XOR',carry:'AND'}:restoredLab;
 const base={...initialProgress,labCircuit,won,inventory:[...new Set([...inventory.filter(id=>id!=='fragment:final'&&id!=='key:secret'),...won.map(id=>'fragment:'+id)])],trapSlots,trapGames};
 const escaped=raw.escaped===true&&hasFragments(base)&&mechanismsReady(base)&&gamesReady(base);
 const secretAnswers=Object.fromEntries(SECRET_ITEMS.filter(i=>MEMBERS.some(m=>m.id===raw.secretAnswers?.[i.id])).map(i=>[i.id,raw.secretAnswers[i.id]]));
 return {...base,room:raw.room==='trap'&&!escaped&&hasFragments(base)?'trap':null,visited:Array.isArray(raw.visited)?raw.visited.filter(x=>typeof x==='string'):[],inventory:[...base.inventory,...(escaped?['key:secret']:[])],hints:Number.isInteger(raw.hints)?Math.max(0,Math.min(3,raw.hints)):0,escaped,secretAnswers,secretSubmitted:Boolean(raw.secretSubmitted)&&escaped&&secretCorrect({secretAnswers})};
 }catch{return initialProgress;}}
