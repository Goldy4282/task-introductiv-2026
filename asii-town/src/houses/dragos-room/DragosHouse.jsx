import { useState, useEffect } from 'react';
import { ArrowLeft, Activity, BookOpen, Cpu, Lightbulb, Package, Wrench, Terminal, CheckCircle2 } from 'lucide-react';
import DetailDialog from '../../components/DetailDialog';
import './dragos.css';

const ROOM_OBJECTS = [
  { id: 'manual', label: 'Lab notebook', hint: 'Study the notes', x: 17, y: 46, Icon: BookOpen,
    description: 'A half-adder adds two single bits. The SUM output is 1 when the inputs differ. The CARRY output is 1 only when both inputs are 1. Use the full truth table to verify your circuit.' },
  { id: 'parts', label: 'Parts drawer', hint: 'Inspect the gates', x: 20, y: 77, Icon: Package,
    description: 'A drawer full of replacement integrated circuits: AND, OR, NOT and XOR. Two are needed to reconstruct the broken half-adder.' },
  { id: 'workbench', label: 'Repair station', hint: 'BUILD THE CIRCUIT', x: 52, y: 73, Icon: Wrench },
  { id: 'computer', label: 'Mainframe', hint: 'System diagnostics', x: 84, y: 62, Icon: Cpu },
  { id: 'lamp', label: 'Room lights', hint: 'Toggle lighting', x: 80, y: 23, Icon: Lightbulb },
  { id: 'tile', label: 'Loose floor tile', hint: 'Inspect the floor', x: 66, y: 89, Icon: Package },
];

const BOOT_MESSAGES = [
  {title:'POWER BUS RECONNECTED',line:'> power: restored · voltage: nominal'},
  {title:'INITIALIZING LOGIC ARRAY',line:'> 2 logic gates detected · signal paths online'},
  {title:'VERIFYING ARITHMETIC UNIT',line:'> half-adder: SUM / CARRY · 4/4 tests passed'},
  {title:'SYSTEM ONLINE',line:'> POST complete · welcome to ASII computer laboratory'},
];

function LabScene({ powered, won }) {
  return <svg className="dl-illustration" viewBox="0 0 1200 710" preserveAspectRatio="none" role="img" aria-label="Perspective illustration of a damaged computer laboratory with walls, tiled floor, repair bench, monitors, bookshelves and server racks">
    <defs>
      <linearGradient id="dlBackWall" x2="0" y2="1"><stop stopColor="#1d3543"/><stop offset="0.7" stopColor="#102631"/><stop offset="1" stopColor="#081b25"/></linearGradient>
      <linearGradient id="dlSideWall"><stop stopColor="#071823"/><stop offset="0.75" stopColor="#1c3a46"/><stop offset="1" stopColor="#0c1c28"/></linearGradient>
      <linearGradient id="dlFloor" x2="0" y2="1"><stop stopColor="#334954"/><stop offset="1" stopColor="#101e28"/></linearGradient>
      <linearGradient id="dlDesk" x2="0" y2="1"><stop stopColor="#566775"/><stop offset=".24" stopColor="#283e4d"/><stop offset="1" stopColor="#122733"/></linearGradient>
      <linearGradient id="dlScreen" x2="0" y2="1"><stop stopColor="#123d45"/><stop offset="1" stopColor="#021820"/></linearGradient>
      <linearGradient id="dlWood" x2="0" y2="1"><stop stopColor="#c0965c"/><stop offset=".15" stopColor="#6d5443"/><stop offset="1" stopColor="#302a2f"/></linearGradient>
      <radialGradient id="dlSpot"><stop stopColor="#92eee3" stopOpacity=".25"/><stop offset="1" stopColor="#3adbd4" stopOpacity="0"/></radialGradient>
      <pattern id="dlMetal" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M0 20 L20 0" stroke="#a1b0ae" strokeOpacity=".08" strokeWidth="1"/></pattern>
      <pattern id="dlScreenLines" patternUnits="userSpaceOnUse" width="6" height="6"><path d="M0 5 H6" stroke="#83e9d2" strokeOpacity=".12"/></pattern>
      <filter id="dl-glow"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="dl-bigshadow"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    {/* Architectural shell: corners, actual perspective walls and floor */}
    <path d="M0 0 H1200 V710 H0 Z" fill="#060f18"/>
    <path d="M0 0 L208 46 V471 L0 597 Z" fill="url(#dlSideWall)"/>
    <path d="M208 46 H992 V471 H208 Z" fill="url(#dlBackWall)"/>
    <path d="M1200 0 L992 46 V471 L1200 597 Z" fill="url(#dlSideWall)"/>
    <path d="M0 0 H1200 L992 46 H208 Z" fill="#0b1b28"/>
    <path d="M0 597 L208 471 H992 L1200 597 V710 H0 Z" fill="url(#dlFloor)"/>
    <path d="M0 597 L208 471 H992 L1200 597" fill="none" stroke="#5c717c" strokeWidth="8"/>
    <path d="M208 46 V471 M992 46 V471" stroke="#304b58" strokeWidth="11"/>
    <path d="M205 81 H995 M205 440 H995" stroke="#314956" strokeWidth="9"/>
    <path d="M0 597 L208 471 M1200 597 L992 471" stroke="#243f4c" strokeWidth="12"/>
    {/* floor tile perspective grid */}
    {Array.from({length:11},(_,i)=><path key={'floor-v'+i} d={'M'+(600+(i-5)*90)+' 471 L'+(600+(i-5)*165)+' 710'} stroke="#7396a0" strokeOpacity=".15" strokeWidth="2"/>)}
    {[0,1,2,3,4].map(i=><path key={'floor-h'+i} d={'M'+(208-i*65)+' '+(473+i*52)+' H'+(992+i*65)} stroke="#7ba8ae" strokeOpacity=".14" strokeWidth="2"/>)}
    {/* ceiling light bar and ambient bloom */}
    <ellipse cx="600" cy="385" rx="475" ry="320" fill="url(#dlSpot)" opacity={powered?'.8':'.25'}/>
    <path d="M445 37 L475 25 H725 L755 37 L725 52 H475 Z" fill="#5d7880"/>
    <path d="M485 29 H715" stroke={powered?'#c4fff1':'#759499'} strokeWidth="10" strokeLinecap="round" filter="url(#dl-glow)" opacity={powered?'.85':'.2'}/>
    <path d="M485 29 H715" stroke={powered?'#d0fff6':'#55717c'} strokeWidth="7" strokeLinecap="round"/>
    {/* industrial ceiling pipes and junction boxes */}
    <path d="M212 96 H385 V120 H430 M988 105 H857 V122 H820" fill="none" stroke="#54717d" strokeWidth="8"/>
    <path d="M212 110 H385 V134 M988 119 H857 V139" fill="none" stroke="#18303e" strokeWidth="5"/>
    <rect x="352" y="113" width="46" height="33" rx="3" fill="#344c5c" stroke="#82969a"/>
    <rect x="856" y="121" width="46" height="33" rx="3" fill="#344c5c" stroke="#82969a"/>
    {/* back wall aperture window */}
    <rect x="431" y="91" width="325" height="210" rx="5" fill="#07111b" stroke="#627c86" strokeWidth="12"/>
    <rect x="443" y="102" width="301" height="187" fill="#143b4f"/>
    <path d="M443 195 L744 115 V289 H443 Z" fill="#0c283b" opacity=".55"/>
    <path d="M443 210 Q550 138 744 229 V289 H443 Z" fill="#0c2634"/>
    <path d="M593 104 V290 M444 203 H744" stroke="#405f69" strokeWidth="9"/>
    {Array.from({length:9},(_,i)=><path key={'window'+i} d={'M'+(463+i*32)+' 113 V282'} stroke="#68c9ce" strokeOpacity=".045" strokeWidth="1"/>)}
    <text x="593" y="322" fill="#93adac" fontSize="12" fontFamily="monospace" letterSpacing="3" textAnchor="middle">COMPUTER SCIENCE LAB // ASII</text>
    {/* left wall mounted soldering board */}
    <path d="M25 191 L173 169 V355 L25 384 Z" fill="#142e3a" stroke="#5c7d80" strokeWidth="7"/>
    <path d="M35 212 L160 193 V331 L35 355 Z" fill="#10383d"/>
    {[0,1,2,3,4].map(i=><g key={'peg'+i}><circle cx={52+i*22} cy={225+i*4} r="5" fill="#c2ab76"/><path d={'M'+(52+i*22)+' '+(230+i*4)+' l8 16 -10 10'} stroke="#5ae2c7" fill="none" strokeWidth="3"/></g>)}
    <text x="51" y="310" fontSize="10" fill="#83c9b8" transform="rotate(-8 51 310)">TOOLS / SPARES</text>
    {/* left cabinet and bookshelf */}
    <path d="M114 354 L288 350 V566 L110 586 Z" fill="#1a2f3b" stroke="#5b7480" strokeWidth="8"/>
    <rect x="131" y="365" width="136" height="46" fill="#091c29" stroke="#5c7981" strokeWidth="3"/>
    <rect x="131" y="422" width="136" height="51" fill="#122a36" stroke="#5c7981" strokeWidth="3"/>
    {[0,1,2,3,4,5].map(i=><rect key={'book'+i} x={140+i*18} y={366+(i%3)*5} width="12" height={39-(i%3)*5} fill={['#bd9563','#628f99','#c27e58'][i%3]} stroke="#1e3542" strokeWidth="1"/>)}
    {[0,1,2,3].map(i=><g key={'drawer'+i}><rect x="132" y={485+i*21} width="132" height="18" fill="#314b59" stroke="#6d828c"/><rect x="185" y={490+i*21} width="26" height="3" rx="2" fill="#b8a273"/></g>)}
    {/* right wall server rack */}
    <path d="M954 265 L1127 300 V567 L948 532 Z" fill="#091723" stroke="#637884" strokeWidth="10"/>
    <path d="M975 284 L1100 309 V543 L975 517 Z" fill="#132936"/>
    {Array.from({length:7},(_,i)=><g key={'srv'+i}><path d={'M982 '+(302+i*30)+' L1093 '+(326+i*30)+' V'+(346+i*30)+' L982 '+(322+i*30)+' Z'} fill="#243a48" stroke="#496574" strokeWidth="2"/><circle cx="1002" cy={312+i*30} r="3" fill={won?'#55f9ba':i===2?'#ff745f':'#c1ac63'}/><circle cx="1017" cy={315+i*30} r="3" fill="#66c7ba"/><path d={'M1040 '+(321+i*30)+' L1081 '+(330+i*30)} stroke="#7b939b" strokeWidth="3"/></g>)}
    <path d="M937 542 L1120 580" stroke="#08131b" strokeWidth="12"/>
    {/* Workbench shadow and heavy desk */}
    <ellipse cx="579" cy="615" rx="370" ry="60" fill="#000" opacity=".45" filter="url(#dl-bigshadow)"/>
    <path d="M286 466 L846 464 L942 529 L245 541 Z" fill="url(#dlWood)" stroke="#b7a07d" strokeWidth="6"/>
    <path d="M245 541 L942 529 L932 554 L251 566 Z" fill="#4a4c50" stroke="#75818a" strokeWidth="3"/>
    <path d="M286 562 L321 557 L299 696 L268 702 Z M852 558 L897 556 L933 704 L894 704 Z" fill="#293d4c" stroke="#72838a" strokeWidth="4"/>
    <path d="M330 565 L851 559 L848 619 L323 621 Z" fill="#132c36" stroke="#486776" strokeWidth="4"/>
    <path d="M354 592 H807" stroke="#6ec1b2" strokeOpacity=".3" strokeDasharray="12 7" strokeWidth="2"/>
    {/* workbench left board / notebook */}
    <path d="M307 474 L415 465 L448 492 L335 507 Z" fill="#c1a17c" stroke="#dfbd8e" strokeWidth="4"/>
    <path d="M326 477 L401 471 L427 490 L348 497" fill="none" stroke="#6b6059" strokeWidth="2"/>
    {[0,1,2].map(i=><path key={'paper'+i} d={'M'+(340+i*8)+' '+(478+i*2)+' l63 -4'} stroke="#405f70" strokeWidth="1"/>)}
    {/* main repair terminal */}
    <path d="M449 303 L772 303 L789 464 L432 464 Z" fill="#182c3a" stroke="#788e96" strokeWidth="11"/>
    <path d="M465 318 H757 L766 446 H455 Z" fill="url(#dlScreen)" stroke="#0a131b" strokeWidth="4"/>
    <path d="M465 318 H757 L766 446 H455 Z" fill="url(#dlScreenLines)" opacity=".6"/>
    <rect x="472" y="327" width="274" height="22" fill="#12343d"/>
    <text x="483" y="343" fill="#7cd6d4" fontSize="12" letterSpacing="2" fontFamily="monospace">ALU / DIAGNOSTIC v2.6</text>
    <circle cx="735" cy="338" r="5" fill={won?'#59f9ad':'#fb8269'}/>
    <text x="610" y="374" textAnchor="middle" fill={won?'#7fffc4':'#ffc185'} fontSize="17" fontWeight="bold" letterSpacing="2" fontFamily="monospace">{won?'SYSTEM ONLINE':'ARITHMETIC UNIT ERROR'}</text>
    <text x="611" y="397" textAnchor="middle" fill="#72c3c3" fontSize="13" fontFamily="monospace">{won?'PASS 4 / 4':'HALF-ADDER NOT DETECTED'}</text>
    <path d="M492 419 H726" stroke="#1b7174" strokeWidth="4"/>
    <path d="M492 419 L522 419 L532 409 L544 429 L556 419 H726" fill="none" stroke="#55e6c5" strokeWidth="2"/>
    <path d="M578 468 H647 L661 482 H566 Z" fill="#5b737a"/>
    <path d="M511 486 L713 483 L753 513 L466 514 Z" fill="#1c343e" stroke="#658089" strokeWidth="5"/>
    {[0,1,2,3,4,5,6,7].map(i=><path key={'key'+i} d={'M'+(484+i*30)+' 495 h19'} stroke="#759e9f" strokeWidth="5"/>)}
    {/* Right desk oscilloscope */}
    <path d="M789 397 L879 406 L902 486 L785 471 Z" fill="#3a515c" stroke="#879599" strokeWidth="7"/>
    <path d="M799 413 L867 421 L882 462 L794 455 Z" fill="#081f2b" stroke="#0b161e" strokeWidth="3"/>
    <path d="M807 437 Q820 421 834 438 T870 438" fill="none" stroke="#69e9b6" strokeWidth="3"/>
    <circle cx="880" cy="473" r="5" fill="#d9ae60"/>
    {/* soldering / breadboard tray */}
    <path d="M437 522 L774 515 L805 535 L416 544 Z" fill="#143b3e" stroke="#6baba3" strokeWidth="5"/>
    {Array.from({length:22},(_,i)=><circle key={'pcb'+i} cx={451+i*14} cy={531-(i%4)} r="2.2" fill={i%3===0?'#f4ae62':'#87dacc'}/>)}
    <path d="M469 527 H518 V522 H563 M610 527 H673 L691 520" fill="none" stroke="#9bcf83" strokeWidth="2"/>
    {/* foreground workshop stool */}
    <ellipse cx="966" cy="611" rx="56" ry="19" fill="#121b26"/>
    <path d="M927 605 L918 693 M996 605 L1012 693 M967 605 V694" stroke="#57616c" strokeWidth="11"/>
    <ellipse cx="961" cy="596" rx="53" ry="23" fill="#5d3c34" stroke="#9a7160" strokeWidth="7"/>
    {/* ambient overlays */}
    <path d="M0 0 H1200 V710 H0 Z" fill={powered?'#59f9df':'#000'} opacity={powered?'.025':'.19'} pointerEvents="none"/>
    <rect x="0" y="0" width="1200" height="710" fill="url(#dlMetal)" opacity=".25" pointerEvents="none"/>
  </svg>;
}

export default function DragosHouse({ member, Game, progress, dispatch, onGameWin, onExit, notify }) {
  const [detail, setDetail] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [lights, setLights] = useState(true);
  const [tileOpen, setTileOpen] = useState(false);
  const [bootStage, setBootStage] = useState(-1);
  useEffect(()=>{
    if (bootStage < 0) return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 180 : bootStage===3 ? 1800 : 850;
    const timer = window.setTimeout(()=>setBootStage(stage=>stage>=3?-1:stage+1),duration);
    return ()=>window.clearTimeout(timer);
  },[bootStage]);
  const won = progress.won.includes(member.id);
  const collected = progress.inventory.includes('keepsake:' + member.id);

  function inspect(object) {
    switch (object.id) {
      case 'workbench': setPlaying(true); break;
      case 'lamp': setLights(v=>!v); break;
      case 'tile': setTileOpen(true); break;
      case 'computer': setDetail({label:'Computer diagnostics',description:won
        ? 'Processor repaired. All four half-adder input combinations have been verified.'
        : 'Boot sequence failed. ALU arithmetic module fault. Repair the half-adder at the workbench.'}); break;
      default: setDetail({label:object.label,description:object.description});
    }
  }

  function complete() {
    onGameWin();
    setPlaying(false);
    setLights(true);
    setBootStage(0);
    notify('Half-adder verified. Mainframe reboot sequence initiated.');
  }

  const booting = bootStage >= 0;
  const sceneOnline = won && (!booting || bootStage===3);
  return <section className={'interior-room dl-room ' + (won?'dl-room-repaired ':'') + (booting?'dl-room-booting':'')}>
    <header className="interior-header dl-room-header"><div className="dl-room-heading"><span className="dl-overline">ASII / INTERACTIVE ENVIRONMENT · ROOM 01</span><h2>THE BROKEN COMPUTER LABORATORY</h2><p>{won?'The arithmetic unit has been restored. All systems are operating normally.':'Someone sabotaged the arithmetic unit. Find the repair station and rebuild the circuit.'}</p></div>
      <div className="dl-room-controls"><span className={'dl-room-health ' + (won?'repaired':'damaged')}><Activity size={16}/>{booting?'REBOOTING':won?'SYSTEM REPAIRED':'SYSTEM FAILURE'}</span><button className="dl-back-button" onClick={onExit}><ArrowLeft size={18}/> Leave room</button></div></header>
    <div className="dl-room-content"><div className="dl-room-view">
      <div className="dl-room-visual"><LabScene powered={lights} won={sceneOnline}/>
        {ROOM_OBJECTS.map(object => <button key={object.id} className={'dl-room-hotspot dl-hotspot-' + object.id} style={{left:object.x+'%',top:object.y+'%'}} disabled={booting} onClick={()=>inspect(object)} title={object.hint}><object.Icon size={16}/><span>{object.label}</span>{object.id==='workbench'&&<strong>INTERACT</strong>}</button>)}
        <div className="dl-scene-corner top-left">LAB / 07 <span>◈</span> RESTRICTED</div><div className="dl-scene-corner bottom-left">LOC. 01 — COMPUTER ENGINEERING</div>
        <div className="dl-scene-corner bottom-right">SCENE 01 / INTERACTIVE</div>
        {booting && <div className={'dl-reboot-overlay ' + (bootStage===3?'dl-boot-success':'')} role="status" aria-live="polite">
          <div className="dl-reboot-terminal">
            <div className="dl-reboot-topline"><Cpu size={22}/><span>MAINFRAME POST // {String(bootStage+1).padStart(2,'0')}/04</span></div>
            <div className="dl-reboot-ring"><Activity size={44}/></div>
            <strong>{BOOT_MESSAGES[bootStage].title}</strong>
            <p>{BOOT_MESSAGES[bootStage].line}</p>
            <div className="dl-reboot-meter"><div style={{width:((bootStage+1)*25)+'%'}} /></div>
            <div className="dl-reboot-bottom"><span>STATUS: {bootStage===3?'OPERATIONAL':'BOOTING'}</span><button onClick={()=>setBootStage(-1)}>{bootStage===3?'Continue':'Skip animation'}</button></div>
          </div>
        </div>}
      </div>
      <div className="dl-room-footer"><div><span className="dl-footer-dot"/><strong>{won?'REPAIR COMPLETE':'EXPLORE THE LAB'}</strong><small>{won?'Four truth-table checks passed. The saved circuit can be inspected.':'Click objects to investigate. The repair station is on the center desk.'}</small></div><button disabled={booting} onClick={()=>setPlaying(true)}><Terminal size={17}/> {won?'Inspect restored circuit':'Open repair console'}</button></div>
    </div>
    <aside className="dl-room-sidebar"><div className="dl-side-index">INCIDENT REPORT / #2046</div><h3>{won?'The laboratory is back online.':'A computer in need of repair.'}</h3><p>{won?'The processor passed all four diagnostic cases. The repaired circuit remains saved in the workbench, ready to inspect.':'A suspicious failure has disabled the laboratory\'s half-adder. Inspect the room, then reconstruct the logic circuit from its truth table.'}</p><div className="dl-sidebar-divider"/><div className="dl-objectives"><span>YOUR OBJECTIVES</span><div className="dl-objective"><span className={won?'done':''}>{won?<CheckCircle2 size={16}/>: '01'}</span><p>Locate the repair station</p></div><div className="dl-objective"><span className={won?'done':''}>{won?<CheckCircle2 size={16}/>: '02'}</span><p>Install two logic gates</p></div><div className="dl-objective"><span className={won?'done':''}>{won?<CheckCircle2 size={16}/>: '03'}</span><p>Pass all four test cases</p></div></div><div className="dl-sidebar-divider"/><div className="dl-secret-status"><small>HIDDEN OBJECT</small>{tileOpen&&!collected?<button onClick={()=>{dispatch({type:'collect',id:'keepsake:'+member.id});notify('Hidden keepsake collected.');}}>Collect hidden laboratory keepsake</button>:<p>{collected?'Keepsake collected':'An unusual floor tile catches your eye.'}</p>}</div></aside>
    </div>
    {detail&&<DetailDialog title={detail.label} onClose={()=>setDetail(null)}><p>{detail.description}</p></DetailDialog>}
    {playing&&Game&&<DetailDialog title="HALF-ADDER REPAIR STATION" onClose={()=>setPlaying(false)}><Game member={member} progress={progress} dispatch={dispatch} onWin={complete} onClose={()=>setPlaying(false)}/></DetailDialog>}
  </section>;
}
