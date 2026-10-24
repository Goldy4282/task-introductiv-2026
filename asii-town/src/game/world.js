export const TILE = 48;
export const COLS = 44;
export const ROWS = 30;
export const WORLD_W = COLS*TILE;
export const WORLD_H = ROWS*TILE;

import {HOUSES} from '../houses';
export {HOUSES} from '../houses';
export const startingTile = {x:22,y:15};
export const key = (x,y) => `${x},${y}`;

// Irregular clearing surrounded by an impassable forest.
export function isLand(x,y){
  const nx=(x-22)/21,ny=(y-15)/14;
  return nx*nx+ny*ny < 1 + .09*Math.sin(x*.7) + .06*Math.cos(y*.9);
}
export function isPath(x,y){
  return (Math.abs(y-(15+Math.round(1.3*Math.sin(x/6))))<=1 && x>=6 && x<=38)
    || HOUSES.some(h=>Math.abs(x-doorTile(h).x)<=0 && y>=Math.min(14,doorTile(h).y)&&y<=Math.max(17,doorTile(h).y))
    || ((x-22)**2+(y-15)**2<=10);
}

function nearHouse(x,y){return HOUSES.some(h=>x>=h.x-1&&x<=h.x+h.w&&y>=h.y-1&&y<=h.y+h.h+1);}
export const TREES=[];
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const edge=!isLand(x,y);
  if(edge?(x+y)%2===0:!isPath(x,y)&&!nearHouse(x,y)&&(x*13+y*7)%19===0){
    TREES.push({x,y,edge});
  }
}
const trunks=new Set(TREES.map(t=>key(t.x,t.y)));
export function hasTree(x,y){return trunks.has(key(x,y));}

export function isBlocked(x,y){
  if(x<1||y<1||x>=COLS-1||y>=ROWS-1||!isLand(x,y)||hasTree(x,y))return true;
  return HOUSES.some(h=>x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h);
}
export function doorTile(h){return {x:h.x+h.doorOffset,y:h.y+h.h};}
export function center(t){return {x:(t.x+.5)*TILE,y:(t.y+.5)*TILE};}
export function toTile(pos){return {x:Math.floor(pos.x/TILE),y:Math.floor(pos.y/TILE)};}
export function findPath(start,end){
  if(isBlocked(end.x,end.y))return [];
  const queue=[start], parents=new Map([[key(start.x,start.y),null]]);
  let index=0; const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(index<queue.length){
    const cur=queue[index++];
    if(cur.x===end.x&&cur.y===end.y){
      const path=[];let at=cur;
      while(at&&! (at.x===start.x&&at.y===start.y)){path.push(center(at));at=parents.get(key(at.x,at.y));}
      return path.reverse();
    }
    for(const [dx,dy] of dirs){let x=cur.x+dx,y=cur.y+dy,k=key(x,y);
      if(!parents.has(k)&&!isBlocked(x,y)){parents.set(k,cur);queue.push({x,y});}}
  }
  return [];
}
export function closestReachable(tile){
  if(!isBlocked(tile.x,tile.y))return tile;
  for(let r=1;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    if(!isBlocked(tile.x+dx,tile.y+dy))return {x:tile.x+dx,y:tile.y+dy};
  }
  return null;
}
