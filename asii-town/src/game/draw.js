import {TILE,COLS,ROWS,HOUSES,WORLD_W,WORLD_H,doorTile,isPath,TREES} from './world';
import {assets} from '../assets';
import asiiSignSrc from '../assets/andrei-room/asii.png';
const images=Object.fromEntries(Object.entries(assets).map(([k,url])=>{const img=new Image();img.src=url;return [k,img];}));
const asiiSign=new Image();asiiSign.src=asiiSignSrc;
export function camera(p,w,h){return {x:Math.max(0,Math.min(Math.max(0,WORLD_W-w),p.x-w/2)),y:Math.max(0,Math.min(Math.max(0,WORLD_H-h),p.y-h/2))};}
function sprite(ctx,img,sx,sy,sw,sh,x,y,w,h){if(img.complete&&img.naturalWidth)ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);}
function house(ctx,h){const x=h.x*TILE,y=h.y*TILE;
 ctx.fillStyle='#193d2840';ctx.fillRect(x+10,y+18,h.w*TILE,h.h*TILE);
 for(let r=0;r<h.h;r++)for(let c=0;c<h.w;c++)sprite(ctx,images.buildings,192+c%2*48,r<2?r*48:96+(r-2)%2*48,48,48,x+c*TILE,y+r*TILE,TILE,TILE);
 const d=doorTile(h);sprite(ctx,images.outside,96,672,48,96,d.x*TILE,(d.y-2)*TILE,TILE,TILE*2);
 // Steagul ASII, mărit la jumătate din lățimea casei și amplasat în stânga ei.
 const flagW = h.w * TILE / 2;
 const flagH = flagW;
 if(asiiSign.complete&&asiiSign.naturalWidth) {
   ctx.drawImage(asiiSign, x - flagW - 8, y + (h.h * TILE - flagH) / 2, flagW, flagH);
 }
 for(const c of [1,h.w-2])sprite(ctx,images.outside,0,576,48,48,x+c*TILE,y+(h.h-2)*TILE,TILE,TILE);
 ctx.font='14px Georgia';ctx.textAlign='center';const labelW=ctx.measureText(h.title).width+30;ctx.fillStyle='#223b2ef0';ctx.fillRect(x+h.w*TILE/2-labelW/2,y-34,labelW,26);ctx.strokeStyle='#b9a16c';ctx.lineWidth=1;ctx.strokeRect(x+h.w*TILE/2-labelW/2,y-34,labelW,26);ctx.fillStyle='#fff0be';ctx.fillText(h.title,x+h.w*TILE/2,y-16);
}
export function drawWorld(ctx,p,target,time,w,h){const c=camera(p,w,h);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#36512d';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(-c.x,-c.y);
 const actors=[];
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
 const px=x*TILE,py=y*TILE;
 // Interior portions of the original A2 tiles avoid autotile preview edges.
 sprite(ctx,images.ground,0,48,48,48,px,py,TILE,TILE);
 if(isPath(x,y))sprite(ctx,images.ground,0,192,48,48,px,py,TILE,TILE);

 }
 TREES.forEach(t=>actors.push({y:(t.y+1)*TILE,draw:()=>sprite(ctx,images.outside,384,288,96,96,t.x*TILE-TILE/2,t.y*TILE-TILE,TILE*2,TILE*2)}));
 HOUSES.forEach(h=>actors.push({y:(h.y+h.h)*TILE,draw:()=>house(ctx,h)}));actors.push({y:p.y,draw:()=>{ctx.fillStyle='#18342255';ctx.beginPath();ctx.ellipse(p.x,p.y+2,15,6,0,0,Math.PI*2);ctx.fill();sprite(ctx,images.actor,(p.pattern??1)*48,({2:0,4:1,6:2,8:3})[p.direction||2]*48,48,48,p.x-24,p.y-42,48,48);}});actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
 if(target){ctx.strokeStyle='#ffe39a';ctx.beginPath();ctx.ellipse(target.x,target.y,15+Math.sin(time/180)*2,8,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
}
