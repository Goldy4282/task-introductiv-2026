// Mobilier propriu, desenat pe grila camerei; aceleași dale controlează coliziunile.
const T=48;
const furniture=[
  {x:1,y:2,w:1,h:2}, {x:2,y:2,w:1,h:1},
  {x:0,y:5,w:2,h:2},
  {x:8,y:4,w:3,h:1},
  {x:10,y:2,w:1,h:1},
  {x:10,y:6,w:2,h:1},
];
export const FURNITURE_TILES=furniture.flatMap(({x,y,w,h})=>
  Array.from({length:w*h},(_,i)=>`${x+i%w},${y+Math.floor(i/w)}`));

export function drawWorkshop(ctx,time) {
  const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const line=(points,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  const circle=(x,y,r,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
  const label=(text,x,y,color='#c5b58a')=>{ctx.fillStyle=color;ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText(text,x,y);};
  // Dalles en pierre verte, joints et petites fissures.
  rect(0,0,624,432,'#172d2a');
  for(let y=2;y<9;y++)for(let x=0;x<13;x++) {
    rect(x*T+1,y*T+1,46,46,(x+y)%2?'#344640':'#3b4d46');
    line([[x*T+3,y*T+44],[x*T+44,y*T+44]],'#233731',2);
    if((x*7+y*3)%5===0)line([[x*T+7,y*T+5],[x*T+13,y*T+13],[x*T+10,y*T+19]],'#293d36');
  }
  // Mur de briques sombres et moulures en laiton.
  rect(0,0,624,96,'#1d3333');
  for(let y=0;y<4;y++)for(let x=-1;x<11;x++) {
    rect(x*64+(y%2)*32+2,y*22+2,61,19,y%2?'#294341':'#253e3e');
  }
  rect(0,86,624,5,'#a28a52');rect(0,94,624,5,'#101f20');
  // Fenêtre de lune au-dessus du cercle d'alchimie.
  circle(312,44,34,'#a28a52',5);
  ctx.save();ctx.beginPath();ctx.arc(312,44,30,0,Math.PI*2);ctx.clip();
  rect(278,10,68,68,'#132333');
  ctx.fillStyle='#e1dfb8';ctx.beginPath();ctx.arc(320,33,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#132333';ctx.beginPath();ctx.arc(327,28,13,0,Math.PI*2);ctx.fill();
  for(const [x,y] of [[294,27],[303,55],[333,58]])rect(x,y,2,2,'#d4d8b0');
  ctx.restore();line([[312,12],[312,77]],'#a28a52',3);line([[280,46],[344,46]],'#a28a52',3);
  label('ATELIERUL ALCHIMISTULUI',480,46);
  // Cerc gravat în podea: decor traversabil.
  const glow=.45+Math.sin(time/1200)*.12;
  circle(300,255,92,`rgba(177,158,87,${glow})`);
  circle(300,255,80,'#7b8058');
  const triangle=offset=>Array.from({length:4},(_,i)=>[300+72*Math.cos(offset+i*2*Math.PI/3),255+72*Math.sin(offset+i*2*Math.PI/3)]);
  line(triangle(-Math.PI/2),'#92916a');line(triangle(Math.PI/2),'#92916a');
  circle(300,255,29,'#93936c');
  // Bibliotecă îngustă în stânga și vitrina medaliei.
  rect(48,96,48,96,'#1c211e');rect(51,99,42,88,'#73573a');
  for(let row=0;row<3;row++) {
    for(let book=0;book<5;book++) {
      const x=55+book*7,y=105+row*26;
      rect(x,y+(book%2)*3,5,19-(book%2)*3,['#7c4745','#748363','#b19557','#466d70','#625b78'][book]);
      rect(x,y+6,5,2,'#c4ac72');
    }
    rect(51,125+row*26,42,4,'#342b22');
  }
  rect(98,105,44,37,'#232c28');rect(102,109,36,27,'#977a46');rect(106,113,28,19,'#284947');
  label('OLIMPIADĂ',120,157);
  // Colț de lectură, cu masa cărții și un scaun orientat spre centru.
  rect(0,240,96,96,'#2c2721');rect(5,244,86,83,'#74543a');
  rect(9,249,78,71,'#89684a');rect(10,323,76,5,'#b19362');
  rect(10,260,24,25,'#294c49');rect(13,263,18,16,'#b5b697');
  label('LECTURĂ',49,347);
  // Bancul de electronică din dreapta; sertare, trasee și eprubete.
  rect(384,192,144,48,'#352e26');rect(387,195,138,35,'#9b7950');
  rect(392,200,126,25,'#365953');
  for(let i=0;i<3;i++){rect(390+i*44,232,38,7,'#69533b');rect(404+i*44,233,10,3,'#c9af71');}
  for(let i=0;i<3;i++) {
    const x=394+i*9;
    rect(x,182,5,17,'#a1c0ae');rect(x+1,188,3,10,['#70c39c','#b8a0cb','#dab565'][i]);
  }
  label('EXPERIMENTE',456,257);
  // Stindard pe suport și platformă industrială pentru inserter.
  rect(477,101,54,4,'#c5a66e');rect(501,105,5,39,'#91784f');
  label('FOR HONOR',504,162);
  rect(480,288,96,48,'#222e2e');rect(484,292,88,40,'#56615b');
  for(let x=489;x<570;x+=13)rect(x,321,8,6,'#bf9c51');
  for(const [x,y] of [[486,294],[565,294],[486,328],[565,328]])rect(x,y,4,4,'#b1b5a1');
  label('AUTOMATIZARE',528,354);
  // Lumină caldă în colțuri, fără să ascundă traseele.
  for(const x of [23,601]) {
    rect(x-3,49,6,21,'#a28a52');
    const light=ctx.createRadialGradient(x,47,2,x,47,70);
    light.addColorStop(0,'rgba(231,183,85,0.25)');light.addColorStop(1,'rgba(231,183,85,0)');
    ctx.fillStyle=light;ctx.fillRect(x-70,0,140,118);
    rect(x-2,42,4,10,'#f3d68b');
  }
}
