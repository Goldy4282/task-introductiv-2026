export const PINS=[
  {id:'5V',y:90,color:'#f3b45e'}, {id:'GND',y:150,color:'#bcc9d0'},
  {id:'D2',y:210,color:'#79cbb0'}, {id:'D3',y:270,color:'#bd9ee3'},
];
export const TERMINALS=[
  {id:'signal',pin:'D2',label:'Semnal LED · D2',y:90},
  {id:'power',pin:'5V',label:'Alimentare · 5V',y:150},
  {id:'control',pin:'D3',label:'Comandă · D3',y:210},
  {id:'ground',pin:'GND',label:'Masă · GND',y:270},
];
export function connect(connections,pin,terminal){
  if(!PINS.some(p=>p.id===pin)||!TERMINALS.some(t=>t.id===terminal))return connections;
  if(Object.entries(connections).some(([p,t])=>p!==pin&&t===terminal))return connections;
  return {...connections,[pin]:terminal};
}
export function evaluate(connections){
  const wrong=PINS.filter(p=>TERMINALS.find(t=>t.id===connections[p.id])?.pin!==p.id).map(p=>p.id);
  return {won:!wrong.length,wrong};
}
