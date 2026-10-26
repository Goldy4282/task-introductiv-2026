import {MEMBERS} from '../content';
import {getRoomObjects} from '../roomObjects';
export const GAME_IDS=['maze','logo','memory'];
export const MEMORY=[0,2,1,3,2];
export const MAZE=['111111111','100010001','111010101','100010101','101110101','100000101','101111101','100000001','111111111'];
export const MAZE_START=[1,1],MAZE_END=[7,1];
export const SECRET_ITEMS=MEMBERS.flatMap((member,index)=>getRoomObjects(member).slice(0,index%2===0?3:2).map(item=>({...item,owner:member.id})));
export const hasFragments=p=>MEMBERS.every(m=>p.won.includes(m.id)&&p.inventory.includes('fragment:'+m.id));
export const mechanismsReady=p=>MEMBERS.every(m=>p.trapSlots?.includes(m.id));
export const gamesReady=p=>GAME_IDS.every(id=>p.trapGames?.includes(id));
export function validGame(id,data){
  if(id==='logo')return Array.isArray(data)&&data.length===9&&data.every((n,i)=>n===i);
  if(id==='memory')return Array.isArray(data)&&data.length===MEMORY.length&&data.every((n,i)=>n===MEMORY[i]);
  if(id==='maze'){
    if(!Array.isArray(data)||data.length<2||data.length>500||data.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isInteger)))return false;
    if(String(data[0])!==String(MAZE_START)||String(data.at(-1))!==String(MAZE_END))return false;
    return data.every(([x,y],i)=>MAZE[y]?.[x]==='0'&&(!i||Math.abs(x-data[i-1][0])+Math.abs(y-data[i-1][1])===1));
  }
  return false;
}
export const secretCorrect=p=>SECRET_ITEMS.every(item=>p.secretAnswers[item.id]===item.owner);
