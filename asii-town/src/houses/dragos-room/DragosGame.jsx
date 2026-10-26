import { useState, useRef, useEffect } from 'react';
import { Cpu, RotateCcw, Play, CheckCircle2, AlertTriangle, MousePointer2, Cable, Zap } from 'lucide-react';
import { GATES, TRUTH_TABLE, circuitReady, circuitOutputs, verifyCircuit } from './halfAdderLogic.mjs';
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

function Lane({ id, gate, selected, onPlace, inputA, inputB, activeOutput, locked, pulse, scanning }) {
  const name = id === 'sum' ? 'SUM' : 'CARRY';
  return <section className={'dl-lane ' + (gate ? 'has-gate' : '')} aria-label={name + ' output circuit'}>
    <header className="dl-lane-top"><span className="dl-lane-index">{id === 'sum' ? '01' : '02'}</span><strong>{name} OUTPUT</strong><span className="dl-lane-chip">{id === 'sum' ? 'S0' : 'C1'} · 1 BIT</span></header>
    <div className={"dl-lane-board " + (scanning ? "is-scanning" : "")}>
      <svg className="dl-wire-svg" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
        <defs><filter id={'glow-' + id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs>
        <path d="M0 55 H130 Q150 55 150 75 H315 M0 145 H130 Q150 145 150 125 H315" className="dl-wire-back"/>
        <path d="M480 100 H800" className="dl-wire-back"/>
        <path d="M0 55 H130 Q150 55 150 75 H315" className={inputA ? 'dl-wire-live' : 'dl-wire-dim'} />
        <path d="M0 145 H130 Q150 145 150 125 H315" className={inputB ? 'dl-wire-live' : 'dl-wire-dim'}/>
        <path d="M480 100 H800" className={activeOutput ? 'dl-wire-live' : 'dl-wire-dim'}/>
        {[55,145].map(y => <circle key={y} cx="5" cy={y} r="9" className="dl-copper-node" />)}
        <circle cx="795" cy="100" r="9" className="dl-copper-node" />
        {gate && <g key={pulse} className="dl-signal-sweep">
          <path d="M0 55 H130 Q150 55 150 75 H315" className="dl-signal-wave dl-signal-a" />
          <path d="M0 145 H130 Q150 145 150 125 H315" className="dl-signal-wave dl-signal-b" />
          <path d="M480 100 H800" className="dl-signal-wave dl-signal-out" />
        </g>}
      </svg>
      <div className="dl-lane-inputs"><div className="dl-pin"><b>A</b><span>{inputA}</span></div><div className="dl-pin"><b>B</b><span>{inputB}</span></div></div>
      <button type="button" className={'dl-socket ' + (gate ? 'filled' : 'empty')} disabled={locked}
        onClick={() => selected && onPlace(id, selected)}
        onDragOver={e => { if (!locked) e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); onPlace(id, e.dataTransfer.getData('text/plain')); }}
        title={locked ? 'Verified circuit: saved and locked' : gate ? 'Gate installed: ' + gate + '. Select a different gate to replace.' : 'Drop or click a gate here'}>
        <span className="dl-socket-bolts">◉ <span>SOCKET {id === 'sum' ? 'U1' : 'U2'}</span> ◉</span>
        {gate ? <><GateSymbol type={gate}/><strong>{gate}</strong></> : <><span className="dl-socket-plus">+</span><strong>INSTALL GATE</strong></>}
        <small>{locked ? 'VERIFIED · SAVED' : gate ? 'click to replace' : 'drop here / select a gate'}</small>
      </button>
      <div className="dl-lane-result"><Led value={activeOutput} label={name}/></div>
    </div>
  </section>;
}

export default function DragosGame({ onWin, onClose, member, progress, dispatch }) {
  const saved = progress?.labCircuit ?? {sum:null,carry:null,a:0,b:0};
  const circuit = {sum:saved.sum,carry:saved.carry};
  const a = saved.a, b = saved.b;
  const completed = Boolean(progress?.won?.includes(member?.id ?? 'guest'));
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(-1);
  const [scanReport, setScanReport] = useState(null);
  const [pulse, setPulse] = useState(0);
  const [message, setMessage] = useState(completed
    ? 'Repair history recovered. The installed circuit passed every diagnostic test.'
    : circuitReady(circuit)
      ? 'Your installed gates have been restored. Test the circuit or change them.'
      : 'Select a gate below, then click an empty socket. You can also drag and drop.');
  const claimed = useRef(completed);
  const ready = circuitReady(circuit);
  const output = circuitOutputs(circuit, a, b);
  const visibleReport = completed ? verifyCircuit(circuit) : report;
  const passed = visibleReport?.passed === true;

  function chooseInputs(nextA, nextB) {
    if (scanning) return;
    dispatch({type:'labInputs',a:nextA,b:nextB});
    setPulse(v=>v+1);
  }

  function placeGate(slot, gate) {
    if (passed || scanning || !GATES.includes(gate)) return;
    dispatch({type:'labPlace',slot,gate});
    setReport(null);
    setSelected(null);
    setPulse(v=>v+1);
    setMessage(gate + ' installed in ' + slot.toUpperCase() + '. ' +
      (slot === 'sum' ? 'Now configure the CARRY circuit.' : 'Run the complete truth-table test when ready.'));
  }

  function run() {
    if (!ready || passed || scanning) return;
    setReport(null);
    setScanReport(verifyCircuit(circuit));
    setScanIndex(0);
    setScanning(true);
    dispatch({type:'labInputs',a:0,b:0});
    setPulse(v=>v+1);
    setMessage('Testing every input combination. Watch the signal paths and the highlighted truth-table row.');
  }

  useEffect(()=>{
    if (!scanning || !scanReport) return undefined;
    const timer = window.setTimeout(()=>{
      if (scanIndex < TRUTH_TABLE.length - 1) {
        const next = scanIndex + 1;
        dispatch({type:'labInputs',a:TRUTH_TABLE[next].a,b:TRUTH_TABLE[next].b});
        setScanIndex(next);
        setPulse(v=>v+1);
      } else {
        setScanning(false);
        setScanIndex(-1);
        setReport(scanReport);
        setMessage(scanReport.passed
          ? 'All four cases match the specification. Restart the computer to finish the repair.'
          : 'Circuit mismatch detected. Inspect the red results, change a gate, and test again.');
      }
    }, 650);
    return ()=>window.clearTimeout(timer);
  },[scanning,scanIndex,scanReport,dispatch]);

  function reset() {
    if (completed || scanning) return;
    dispatch({type:'labReset'});
    setSelected(null);
    setReport(null);
    setScanIndex(-1);
    setScanReport(null);
    setPulse(v=>v+1);
    setMessage('Circuit cleared. Build the SUM and CARRY channels from the truth table.');
  }

  function claim() {
    if (!report?.passed || claimed.current || completed) return;
    claimed.current = true;
    onWin?.();
  }

  const activeExpected = TRUTH_TABLE.find(row=>row.a===a&&row.b===b);
  return <div className="half-adder dl-workstation">
    <div className="dl-topbar"><div className="dl-topbar-brand"><Cpu size={22}/><div><strong>ALU / REPAIR CONSOLE</strong><small>ASII LABORATORY · STATION 04</small></div></div><div className={'dl-topbar-status ' + (passed ? 'online' : 'offline')}><span/>{completed ? 'SYSTEM RESTORED' : scanning ? 'TESTING CIRCUIT' : passed ? 'DIAGNOSTICS PASSED' : 'DIAGNOSTIC MODE'}</div></div>
    <div className="dl-workspace">
      <aside className="dl-sidebar">
        <section className="dl-section dl-spec"><div className="dl-section-label"><span>01 / SPECIFICATION</span><span className="dl-mini-light"/></div><h3>Half-adder</h3><p>Two binary inputs. Two outputs. Rebuild the damaged logic from the expected behavior.</p>
          <table className="dl-table"><thead><tr><th>A</th><th>B</th><th>SUM</th><th>CARRY</th></tr></thead><tbody>{TRUTH_TABLE.map(row=><tr key={''+row.a+row.b} className={row.a===a&&row.b===b?'dl-current-row':''} data-current={row.a===a&&row.b===b?'true':'false'}><td>{row.a}</td><td>{row.b}</td><td>{row.sum}</td><td>{row.carry}</td></tr>)}</tbody></table>
          <p className="dl-tiny-note">Every combination must match, not just the current inputs.</p>
          <div className="dl-active-case"><span>LIVE ROW / {a}{b}</span><strong>SUM {activeExpected?.sum} <i>·</i> CARRY {activeExpected?.carry}</strong></div>
        </section>
        <section className="dl-section dl-components"><div className="dl-section-label">02 / COMPONENT TRAY</div><h3>Logic gates</h3><p>Click to pick up a gate, or drag it into a socket.</p>
          <div className="dl-gate-grid">{GATES.map(type=><button type="button" key={type} draggable={!passed && !scanning} onDragStart={e=>{e.dataTransfer.setData('text/plain',type);setSelected(type);}} disabled={passed||scanning} onClick={()=>{setSelected(type);setMessage(type+' selected. Click either circuit socket to install it.');}} className={'dl-gate-tile ' + (selected === type ? 'selected' : '')} title={gateDescription[type]}><GateSymbol type={type} small/><strong>{type}</strong></button>)}</div>
          {selected && <p className="dl-selected-note"><MousePointer2 size={14}/> {selected} selected — click a socket</p>}
        </section>
        <div className="dl-maintenance"><Zap size={16}/> MAINTENANCE ACCESS / AUTHORIZED</div>
      </aside>
      <div className="dl-main-panel">
        <div className="dl-main-heading"><div><span className="dl-overline">03 / CIRCUIT BOARD</span><h3>Logic reconstruction</h3></div><span className="dl-board-serial">PCB-8B / REV 02</span></div>
        <div className="dl-live-controls"><span>INPUT SIGNALS</span><button className={'dl-toggle ' + (a ? 'lit' : '')} disabled={scanning} onClick={()=>chooseInputs(1-a,b)}>A <strong>{a}</strong></button><button className={'dl-toggle ' + (b ? 'lit' : '')} disabled={scanning} onClick={()=>chooseInputs(a,1-b)}>B <strong>{b}</strong></button><small>{scanning ? 'AUTOMATED INPUT SWEEP · CASE '+(scanIndex+1)+'/4' : 'Click to simulate 0 / 1'}</small></div>
        <div className="dl-lanes"><Lane id="sum" gate={circuit.sum} selected={selected} onPlace={placeGate} inputA={a} inputB={b} activeOutput={output.sum} locked={passed||scanning} pulse={pulse} scanning={scanning}/><Lane id="carry" gate={circuit.carry} selected={selected} onPlace={placeGate} inputA={a} inputB={b} activeOutput={output.carry} locked={passed||scanning} pulse={pulse} scanning={scanning}/></div>
        <p className="dl-instruction" role="status"><Cable size={16}/>{message}</p>
        <div className="dl-actions"><button type="button" className="dl-run-button" disabled={!ready || passed || scanning} onClick={run}><Play size={18} fill="currentColor"/> {scanning ? 'TESTING '+(scanIndex+1)+' / 4' : 'RUN ALL FOUR TESTS'}</button><button type="button" className="dl-reset-button" disabled={completed||scanning} onClick={reset}><RotateCcw size={16}/> Reset board</button><span>{completed ? 'REPAIRED · CIRCUIT LOCKED' : scanning ? 'RUNNING ALL FOUR INPUT CASES' : ready ? 'READY TO VERIFY' : 'INSTALL TWO GATES TO ENABLE TESTING'}</span></div>
        {visibleReport && <div className={'dl-report ' + (visibleReport.passed ? 'success' : 'failure')}><header>{visibleReport.passed ? <CheckCircle2 size={22}/> : <AlertTriangle size={22}/>}<strong>{completed ? 'REPAIR COMPLETE · SAVED CIRCUIT' : visibleReport.passed ? 'ALL FOUR TESTS PASSED' : 'TEST FAILURE — RECONFIGURE GATES'}</strong></header>
          <div className="dl-report-grid">{visibleReport.rows.map(row=><div key={''+row.a+row.b} className={row.passed ? 'pass' : 'fail'}><span>AB = {row.a}{row.b}</span><strong>{row.passed ? 'PASS' : 'FAIL'}</strong><small>SUM {row.actualSum} / CARRY {row.actualCarry}</small></div>)}</div>
          {visibleReport.passed && !completed && <button type="button" className="dl-claim-button" onClick={claim}>RESTART COMPUTER · CLAIM MODULE</button>}
          {completed && <p className="dl-repaired-note"><CheckCircle2 size={16}/> Verified circuit saved in game progress. The mainframe is running.</p>}
        </div>}
        <button className="dl-exit-button" onClick={onClose}>← Return to laboratory</button>
      </div>
    </div>
  </div>;
}
