import { useState, useRef } from 'react';
import { Cpu, RotateCcw, Play, CheckCircle2, AlertTriangle, MousePointer2, Cable, Zap } from 'lucide-react';
import { GATES, TRUTH_TABLE, gateOutput, circuitReady, circuitOutputs, verifyCircuit } from './halfAdderLogic.mjs';
import './dragos.css';

const gateDescription = {
  AND: '1 only when both inputs are 1',
  OR: '1 when at least one input is 1',
  NOT: 'Inverts input A',
  XOR: '1 when the two inputs differ',
};

function GateSymbol({ type, small = false }) {
  return <svg className={small ? 'dl-gate-symbol dl-gate-small' : 'dl-gate-symbol'} viewBox="0 0 100 70" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      {type === 'AND' && <path d="M18 8 H46 Q83 8 83 35 Q83 62 46 62 H18 Z" />}
      {type === 'OR' && <path d="M19 8 Q46 8 82 35 Q46 62 19 62 Q40 35 19 8 Z" />}
      {type === 'XOR' && <><path d="M22 8 Q49 8 84 35 Q49 62 22 62 Q43 35 22 8 Z"/><path d="M12 8 Q33 35 12 62" /></>}
      {type === 'NOT' && <><path d="M18 9 L77 35 L18 61 Z"/><circle cx="85" cy="35" r="7"/></>}
    </g>
  </svg>;
}

function Led({ value, label }) {
  return <div className="dl-led-box"><span className={'dl-led ' + (value === 1 ? 'is-on' : value === 0 ? 'is-off' : 'is-idle')} />
    <span className="dl-led-number">{value ?? '–'}</span><small>{label}</small></div>;
}

function Lane({ id, gate, selected, onPlace, inputA, inputB, activeOutput, locked }) {
  const name = id === 'sum' ? 'SUM' : 'CARRY';
  return <section className={'dl-lane ' + (gate ? 'has-gate' : '')} aria-label={name + ' output circuit'}>
    <header className="dl-lane-top"><span className="dl-lane-index">{id === 'sum' ? '01' : '02'}</span><strong>{name} OUTPUT</strong><span className="dl-lane-chip">{id === 'sum' ? 'S0' : 'C1'} · 1 BIT</span></header>
    <div className="dl-lane-board">
      <svg className="dl-wire-svg" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
        <defs><filter id={'glow-' + id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs>
        <path d="M0 55 H130 Q150 55 150 75 H315 M0 145 H130 Q150 145 150 125 H315" className="dl-wire-back"/>
        <path d="M480 100 H800" className="dl-wire-back"/>
        <path d="M0 55 H130 Q150 55 150 75 H315" className={inputA ? 'dl-wire-live' : 'dl-wire-dim'} />
        <path d="M0 145 H130 Q150 145 150 125 H315" className={inputB ? 'dl-wire-live' : 'dl-wire-dim'}/>
        <path d="M480 100 H800" className={activeOutput ? 'dl-wire-live' : 'dl-wire-dim'}/>
        {[55,145].map(y => <circle key={y} cx="5" cy={y} r="9" className="dl-copper-node" />)}
        <circle cx="795" cy="100" r="9" className="dl-copper-node" />
      </svg>
      <div className="dl-lane-inputs"><div className="dl-pin"><b>A</b><span>{inputA}</span></div><div className="dl-pin"><b>B</b><span>{inputB}</span></div></div>
      <button type="button" className={'dl-socket ' + (gate ? 'filled' : 'empty')} disabled={locked}
        onClick={() => selected && onPlace(id, selected)}
        onDragOver={e => { if (!locked) e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); onPlace(id, e.dataTransfer.getData('text/plain')); }}
        title={gate ? 'Gate installed: ' + gate + '. Select a different gate to replace.' : 'Drop or click a gate here'}>
        <span className="dl-socket-bolts">◉ <span>SOCKET {id === 'sum' ? 'U1' : 'U2'}</span> ◉</span>
        {gate ? <><GateSymbol type={gate}/><strong>{gate}</strong></> : <><span className="dl-socket-plus">+</span><strong>INSTALL GATE</strong></>}
        <small>{gate ? 'click to replace' : 'drop here / select a gate'}</small>
      </button>
      <div className="dl-lane-result"><Led value={activeOutput} label={name}/></div>
    </div>
  </section>;
}

export default function DragosGame({ onWin, onClose }) {
  const [circuit, setCircuit] = useState({ sum: null, carry: null });
  const [selected, setSelected] = useState(null);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('Select a gate below, then click an empty socket. You can also drag and drop.');
  const claimed = useRef(false);
  const ready = circuitReady(circuit);
  const output = circuitOutputs(circuit, a, b);
  const passed = report?.passed === true;

  function placeGate(slot, gate) {
    if (passed || !GATES.includes(gate)) return;
    setCircuit(prev => ({ ...prev, [slot]: gate }));
    setReport(null);
    setSelected(null);
    setMessage(gate + ' installed in ' + slot.toUpperCase() + '. ' + (slot === 'sum' ? 'Now configure the CARRY circuit.' : 'Run the complete truth-table test when ready.'));
  }

  function run() {
    const evaluation = verifyCircuit(circuit);
    setReport(evaluation);
    setMessage(evaluation.passed
      ? 'All four cases match the specification. The processor can be restored.'
      : 'Circuit mismatch detected. Inspect the red rows, change a gate, and test again.');
  }

  function reset() {
    setCircuit({ sum: null, carry: null });
    setSelected(null);
    setA(0);
    setB(0);
    setReport(null);
    claimed.current = false;
    setMessage('Circuit cleared. Build the SUM and CARRY channels from the truth table.');
  }

  function claim() {
    if (!passed || claimed.current) return;
    claimed.current = true;
    onWin?.();
  }

  return <div className="half-adder dl-workstation">
    <div className="dl-topbar"><div className="dl-topbar-brand"><Cpu size={22}/><div><strong>ALU / REPAIR CONSOLE</strong><small>ASII LABORATORY · STATION 04</small></div></div><div className={'dl-topbar-status ' + (passed ? 'online' : 'offline')}><span/>{passed ? 'SYSTEM RESTORED' : 'DIAGNOSTIC MODE'}</div></div>
    <div className="dl-workspace">
      <aside className="dl-sidebar">
        <section className="dl-section dl-spec"><div className="dl-section-label"><span>01 / SPECIFICATION</span><span className="dl-mini-light"/></div><h3>Half-adder</h3><p>Two binary inputs. Two outputs. Rebuild the damaged logic from the expected behavior.</p>
          <table className="dl-table"><thead><tr><th>A</th><th>B</th><th>SUM</th><th>CARRY</th></tr></thead><tbody>{TRUTH_TABLE.map(row=><tr key={''+row.a+row.b}><td>{row.a}</td><td>{row.b}</td><td>{row.sum}</td><td>{row.carry}</td></tr>)}</tbody></table>
          <p className="dl-tiny-note">Every combination must match, not just the current inputs.</p>
        </section>
        <section className="dl-section dl-components"><div className="dl-section-label">02 / COMPONENT TRAY</div><h3>Logic gates</h3><p>Click to pick up a gate, or drag it into a socket.</p>
          <div className="dl-gate-grid">{GATES.map(type=><button type="button" key={type} draggable={!passed} onDragStart={e=>{e.dataTransfer.setData('text/plain',type);setSelected(type);}} onClick={()=>{setSelected(type);setMessage(type+' selected. Click either circuit socket to install it.');}} className={'dl-gate-tile ' + (selected === type ? 'selected' : '')} title={gateDescription[type]}><GateSymbol type={type} small/><strong>{type}</strong></button>)}</div>
          {selected && <p className="dl-selected-note"><MousePointer2 size={14}/> {selected} selected — click a socket</p>}
        </section>
        <div className="dl-maintenance"><Zap size={16}/> MAINTENANCE ACCESS / AUTHORIZED</div>
      </aside>
      <div className="dl-main-panel">
        <div className="dl-main-heading"><div><span className="dl-overline">03 / CIRCUIT BOARD</span><h3>Logic reconstruction</h3></div><span className="dl-board-serial">PCB-8B / REV 02</span></div>
        <div className="dl-live-controls"><span>INPUT SIGNALS</span><button className={'dl-toggle ' + (a ? 'lit' : '')} onClick={()=>setA(v=>1-v)}>A <strong>{a}</strong></button><button className={'dl-toggle ' + (b ? 'lit' : '')} onClick={()=>setB(v=>1-v)}>B <strong>{b}</strong></button><small>Click to simulate 0 / 1</small></div>
        <div className="dl-lanes"><Lane id="sum" gate={circuit.sum} selected={selected} onPlace={placeGate} inputA={a} inputB={b} activeOutput={output.sum} locked={passed}/><Lane id="carry" gate={circuit.carry} selected={selected} onPlace={placeGate} inputA={a} inputB={b} activeOutput={output.carry} locked={passed}/></div>
        <p className="dl-instruction" role="status"><Cable size={16}/>{message}</p>
        <div className="dl-actions"><button type="button" className="dl-run-button" disabled={!ready || passed} onClick={run}><Play size={18} fill="currentColor"/> RUN ALL FOUR TESTS</button><button type="button" className="dl-reset-button" onClick={reset}><RotateCcw size={16}/> Reset board</button><span>{ready ? 'READY TO VERIFY' : 'INSTALL TWO GATES TO ENABLE TESTING'}</span></div>
        {report && <div className={'dl-report ' + (report.passed ? 'success' : 'failure')}><header>{report.passed ? <CheckCircle2 size={22}/> : <AlertTriangle size={22}/>}<strong>{report.passed ? 'ALL FOUR TESTS PASSED' : 'TEST FAILURE — RECONFIGURE GATES'}</strong></header>
          <div className="dl-report-grid">{report.rows.map(row=><div key={''+row.a+row.b} className={row.passed ? 'pass' : 'fail'}><span>AB = {row.a}{row.b}</span><strong>{row.passed ? 'PASS' : 'FAIL'}</strong><small>SUM {row.actualSum} / CARRY {row.actualCarry}</small></div>)}</div>
          {report.passed && <button type="button" className="dl-claim-button" onClick={claim}>RESTART COMPUTER · CLAIM MODULE</button>}
        </div>}
        <button className="dl-exit-button" onClick={onClose}>← Return to laboratory</button>
      </div>
    </div>
  </div>;
}
