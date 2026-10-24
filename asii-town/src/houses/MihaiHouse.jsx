import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Power, ScanLine, Rocket, X, Lock, Radio, Bug } from 'lucide-react';

/*
  Imaginea se pune în:  public/mihai/cosmic-room.png
  Se servește de la /mihai/cosmic-room.png (respectă `base` din vite.config dacă există).
*/
const IMG = `${(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/'}mihai/cosmic-room.png`;

const TOTAL = 8;
const NEEDS_POWER = ['tank', 'champ', 'desk', 'galaxy', 'drawer'];

/*
  Hotspot-uri în procente din imagine (16:9): x, y = colț stânga-sus; w, h = dimensiuni.
  Ultimele din listă stau deasupra. Ajustează aici, cu butonul „Debug” activ.
*/
const HOTSPOTS = [
  { key: 'tank', id: 'tank', label: 'Afiș cu un tanc de luptă pe un câmp de luptă sci-fi', x: 6, y: 22, w: 18, h: 46 },
  { key: 'galaxy', id: 'galaxy', label: 'Hublou cu o galaxie spirală', x: 44, y: 10, w: 43, h: 19 },
  { key: 'desk-screens', id: 'desk', label: 'Ecranele de diagnostic ale biroului de robotică', x: 41, y: 33, w: 16.5, h: 17 },
  { key: 'desk', id: 'desk', label: 'Birou de robotică cu microcontroller, senzori și un mic robot', x: 28, y: 50, w: 27, h: 31, zoom: { x: 28, y: 33, w: 29, h: 48 } },
  { key: 'champ', id: 'champ', label: 'Afiș cu un campion fantasy', x: 25, y: 29, w: 15, h: 28 },
  { key: 'frame', id: 'frame', label: 'Tablou încadrat cu un simbol tehnologic', x: 60, y: 38, w: 7.5, h: 16 },
  { key: 'bed', id: 'bed', label: 'Pat cu lenjerie albastră cu stele', x: 70, y: 53, w: 30, h: 47 },
  { key: 'shelves', id: 'shelves', label: 'Rafturi cu piese și obiecte de colecție', x: 87.5, y: 30, w: 12.5, h: 28.5 },
  { key: 'drawer', id: 'drawer', label: 'Noptieră cu sertar ascuns', x: 64, y: 60, w: 6.5, h: 13 },
];

// panoul de întreținere care acoperă sertarul (centru + dimensiuni, în %)
const PANEL = { cx: 67.2, cy: 66.5, w: 8.5, h: 17 };

const DIAG = [
  '> boot... OK',
  '> i2c scan: 3 senzori găsiți',
  '> motor stâng: OK · motor drept: merge invers (clasic)',
  '> bug #1: un fir era inversat. Reparat.',
  '> prototip v0.2 merge drept. Aproape.',
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function zoomRect(id) {
  const h = HOTSPOTS.find((x) => x.id === id && x.zoom) || HOTSPOTS.find((x) => x.id === id);
  return h ? h.zoom || h : null;
}

function ZoomView({ id }) {
  const r = zoomRect(id);
  if (!r) return null;
  const ratio = (r.w * 16) / (r.h * 9);
  return (
    <div
      className="mh-zoom"
      role="img"
      aria-label="Detaliu decupat din imaginea camerei"
      style={{
        aspectRatio: ratio,
        width: `min(100%, ${Math.round(200 * ratio)}px)`,
        backgroundImage: `url(${IMG})`,
        backgroundSize: `${10000 / r.w}% ${10000 / r.h}%`,
        backgroundPosition: `${r.w < 100 ? (r.x / (100 - r.w)) * 100 : 0}% ${r.h < 100 ? (r.y / (100 - r.h)) * 100 : 0}%`,
      }}
    />
  );
}

export default function MihaiHouse({ member, progress, dispatch, onExit, notify, selectedItem, onUse, Game, onGameWin }) {
  const [on, setOn] = useState(false);
  const [seen, setSeen] = useState({});
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [pings, setPings] = useState(false);
  const [panel, setPanel] = useState({ x: 0, y: 0 });
  const [snap, setSnap] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [found, setFound] = useState(false);
  const [decrypted, setDecrypted] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [debug, setDebug] = useState(false);
  const [imgFail, setImgFail] = useState(false);

  const sceneRef = useRef(null);
  const drag = useRef(null);
  const timers = useRef([]);
  const foundRef = useRef(false);
  const winRef = useRef(false);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const safeNotify = useCallback((text) => {
    try { if (typeof notify === 'function') notify(text); } catch (e) { /* ignorat */ }
  }, [notify]);

  const toast = useCallback((text, kind = '') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    later(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, [later]);

  const sparks = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      left: `${(i * 37 + 11) % 100}%`,
      size: 2 + (i % 3),
      delay: `${(i * 0.9) % 9}s`,
      dur: `${9 + (i % 5) * 2}s`,
    })),
    []
  );

  useEffect(() => {
    if (!modal) return undefined;
    const h = (e) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal]);

  const open = (id) => {
    if (NEEDS_POWER.includes(id) && !on) {
      toast('Acces restricționat — sistemul este în standby.', 'warn');
      return;
    }
    if (id === 'drawer') {
      if (!revealed) { toast('Acces restricționat — compartimentul e blocat de un panou.', 'warn'); return; }
      if (!foundRef.current) {
        foundRef.current = true; // fragmentul se colectează o singură dată
        setFound(true);
        toast('Ai găsit un fragment!', 'ok');
        safeNotify('Ai găsit un fragment!');
      }
    }
    setSeen((s) => (s[id] ? s : { ...s, [id]: true }));
    setModal(id);
  };

  const togglePower = () => {
    if (on) { setOn(false); toast('Sistem în standby.'); return; }
    setOn(true);
    toast('Sistem activat', 'ok');
  };

  const scan = () => {
    if (!on) { toast('Acces restricționat — pornește sistemul pentru scanare.', 'warn'); return; }
    if (scanning) return;
    setScanning(true);
    later(() => {
      setScanning(false);
      setPings(true);
      toast('Modul de scanare finalizat', 'ok');
      later(() => setPings(false), 3200);
    }, 2200);
  };

  // ---- drag & drop pentru panoul de întreținere ----
  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    toast('Panou deplasat — compartiment descoperit.', 'ok');
  };
  const onPanelDown = (e) => {
    if (!on) { toast('Acces restricționat — panoul e blocat cât timp sistemul e oprit.', 'warn'); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX - panel.x, sy: e.clientY - panel.y };
    setSnap(false);
  };
  const onPanelMove = (e) => {
    if (!drag.current || !sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    setPanel({
      x: clamp(e.clientX - drag.current.sx, -r.width * 0.35, r.width * 0.35),
      y: clamp(e.clientY - drag.current.sy, -r.height * 0.3, r.height * 0.3),
    });
  };
  const onPanelUp = (e) => {
    if (!drag.current) return;
    drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { /* ignorat */ }
    const r = sceneRef.current ? sceneRef.current.getBoundingClientRect() : { width: 600 };
    if (Math.abs(panel.x) + Math.abs(panel.y) > Math.max(36, r.width * 0.06)) {
      reveal();
    } else {
      setSnap(true);
      setPanel({ x: 0, y: 0 });
    }
  };
  const onPanelKey = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!on) { toast('Acces restricționat — panoul e blocat cât timp sistemul e oprit.', 'warn'); return; }
    const r = sceneRef.current ? sceneRef.current.getBoundingClientRect() : { width: 600, height: 340 };
    setSnap(true);
    setPanel({ x: r.width * 0.12, y: -r.height * 0.08 });
    reveal();
  };

  const handleWin = useCallback(() => {
    if (winRef.current) return;
    winRef.current = true;
    setDecrypted(true);
    toast('Fragment decriptat!', 'ok');
    safeNotify('Fragment decriptat!');
    if (typeof onGameWin === 'function') onGameWin();
  }, [onGameWin, toast, safeNotify]);

  const launchGame = () => {
    if (!Game) { toast('Simulatorul nu este disponibil încă.', 'warn'); return; }
    setModal(null);
    setGameOpen(true);
  };

  const count = Object.keys(seen).length;
  const status = decrypted ? 'FRAGMENT DECRIPTAT' : on ? `MISIUNE ACTIVĂ · ${count}/${TOTAL} INSPECTATE` : 'STANDBY';

  const renderModal = () => {
    switch (modal) {
      case 'tank':
        return (
          <>
            <span className="tag">AFIȘ · SECTOR HANGAR</span>
            <h2>Colosul de oțel</h2>
            <p>Un colos de oțel nu câștigă prin zgomot. Câștigă prin unghi, prin răbdare și printr-o lovitură pusă exact unde trebuie. Cine privește acest afiș prețuiește planul dinaintea focului.</p>
            <p style={{ color: '#ff8a2a' }}>Precizie · Strategie · Răbdare</p>
          </>
        );
      case 'champ':
        return (
          <>
            <span className="tag">AFIȘ · SECTOR ARENĂ</span>
            <h2>Străjerul de cristal</h2>
            <p>O siluetă în armură luminoasă, cu o lume întreagă în spate. Pe hărțile competitive, un personaj bine desenat cântărește cât o strategie bine jucată: cine îl privește vede deopotrivă arta și arena.</p>
            <p style={{ color: '#ff8a2a' }}>Design · Personaje · Lumi competitive</p>
          </>
        );
      case 'desk':
        return (
          <>
            <span className="tag">BIROU · LABORATOR DE ROBOTICĂ</span>
            <h2>Atelierul de prototipuri</h2>
            <p>Un microcontroller, câțiva senzori, fire colorate și un robot care încă nu merge drept. Prototipul e prima versiune a unei idei; debugging-ul e dialogul cu ea, iar sistemele embedded sunt limba în care ea răspunde.</p>
            <div className="mh-term">
              {logs.length === 0 && <span style={{ opacity: 0.5 }}>&gt; terminal gata. Rulează diagnosticul.</span>}
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <button
              type="button"
              className="mh-btn"
              disabled={logs.length >= DIAG.length}
              onClick={() => setLogs((l) => (l.length < DIAG.length ? [...l, DIAG[l.length]] : l))}
            >
              <Radio size={14} /> {logs.length === 0 ? 'Rulează diagnostic' : 'Următorul pas'}
            </button>
          </>
        );
      case 'galaxy':
        return (
          <>
            <span className="tag">HUBLOU · OBSERVATOR</span>
            <h2>Fereastra spre spirală</h2>
            <p>Dincolo de geam, o spirală de lumină și nave care nu au fost încă inventate. Cine ține ochii pe cer visează viitorul cu motoare ionice și povești cu final deschis.</p>
          </>
        );
      case 'bed':
        return (
          <>
            <span className="tag">CABINĂ · ZONA DE REPAUS</span>
            <h2>Capsula de somn</h2>
            <p>Lenjerie albastră cu constelații: singurul loc unde gravitația e opțională. Misiunea „somn 8 ore” are 97% șanse de eșec dacă mai există un episod SF neterminat.</p>
          </>
        );
      case 'frame':
        return (
          <>
            <span className="tag">TABLOU · PERETE CENTRAL</span>
            <h2>Deviza atelierului</h2>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#ffe7b0' }}>„Orice sistem interesant începe ca un prototip.”</p>
          </>
        );
      case 'shelves':
        return (
          <>
            <span className="tag">RAFTURI · COLECȚIE</span>
            <h2>Rafturile cu piese de rezervă</h2>
            <p>Rachete în miniatură, o cască de pilot, chei și brațe mecanice puse la păstrare, plus cărți cu cotoarele uzate de atâtea recitiri. Colecția cuiva care nu aruncă nimic ce ar putea deveni piesă de schimb sau început de poveste.</p>
          </>
        );
      case 'drawer':
        return (
          <>
            <span className="tag">COMPARTIMENT ASCUNS</span>
            <h2>Cutia de date</h2>
            {decrypted ? (
              <div className="mh-fragment">Fragment decriptat: „Coordonate: acolo unde un șurub strâns bine și un cer fără margini lucrează la același proiect.”</div>
            ) : (
              <>
                <div className="mh-term"><span className="mh-cipher">▓▒░ 7F·A3·C1 ░▒▓ 09·E4·B2 ▓▒░ 5D·11·8C ░▒▓</span></div>
                <p>Fragmentul este criptat. Singura cheie: câștigă o simulare de luptă.</p>
                <button type="button" className="mh-btn hot" onClick={launchGame}>
                  <Rocket size={14} /> Lansează simulatorul
                </button>
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`mh-root ${on ? 'mh-on' : 'mh-off'}${debug ? ' mh-debug' : ''}`}>
      <div className="mh-stars" />
      {sparks.map((s, i) => (
        <span key={i} className="mh-spark" style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }} />
      ))}

      <header className="mh-top">
        <div className="mh-title">
          <small>ASII TOWN · SECTOR PRIVAT</small>
          <h1>Camera inginerului cosmic</h1>
        </div>
        <div className="mh-status"><span className="mh-dot" />{status}</div>
        <div className="mh-actions">
          <button type="button" className="mh-btn hot" onClick={togglePower}>
            <Power size={14} /> {on ? 'Oprește sistemul' : 'Pornește sistemul'}
          </button>
          <button type="button" className="mh-btn" onClick={scan} disabled={scanning}>
            <ScanLine size={14} /> Scanează
          </button>
          {/* buton de dezvoltare: șterge-l când hotspot-urile sunt aliniate */}
          <button type="button" className="mh-btn" onClick={() => setDebug((d) => !d)} aria-pressed={debug}>
            <Bug size={14} /> Debug
          </button>
          <button type="button" className="mh-btn" onClick={() => onExit && onExit()}>
            <ArrowLeft size={14} /> Înapoi în oraș
          </button>
        </div>
      </header>

      <div className="mh-hint">
        {!on
          ? '▸ Sistem în standby. Pornește sistemul pentru a trezi camera.'
          : revealed
            ? '▸ Compartiment descoperit. Inspectează noptiera.'
            : '▸ Un panou de întreținere acoperă ceva lângă pat. Încearcă să-l tragi.'}
      </div>

      <div className="mh-stagewrap">
        <div className="mh-scene" ref={sceneRef}>
          <img
            className="mh-bg"
            src={IMG}
            alt="Cameră de navă spațială cu un afiș cu tanc, un afiș cu un războinic fantasy, un birou de robotică cu un mic robot, un hublou cu o galaxie, un tablou, rafturi și un pat cu lenjerie cu stele."
            draggable={false}
            onError={() => setImgFail(true)}
          />
          <div className="mh-flicker" />
          <div className="mh-vignette" />
          {scanning && <div className="mh-scan" />}

          {HOTSPOTS.map((h) => {
            const locked = NEEDS_POWER.includes(h.id) && !on;
            const cls = [
              'mh-hot',
              locked ? 'locked' : '',
              pings && !seen[h.id] ? 'ping' : '',
              h.id === 'drawer' && revealed && !found ? 'glow' : '',
            ].join(' ');
            return (
              <button
                key={h.key}
                type="button"
                className={cls}
                aria-label={h.label}
                data-debug={`${h.key} ${h.x},${h.y} ${h.w}×${h.h}`}
                style={{ left: `${h.x + h.w / 2}%`, top: `${h.y + h.h / 2}%`, width: `${h.w}%`, height: `${h.h}%` }}
                onClick={() => open(h.id)}
              />
            );
          })}

          <div
            className={`mh-panel${snap ? ' snap' : ''}${revealed ? ' done' : ''}`}
            style={{
              left: `${PANEL.cx}%`,
              top: `${PANEL.cy}%`,
              width: `${PANEL.w}%`,
              height: `${PANEL.h}%`,
              transform: `translate(calc(-50% + ${panel.x}px), calc(-50% + ${panel.y}px))`,
            }}
            role="button"
            tabIndex={revealed ? -1 : 0}
            aria-hidden={revealed}
            aria-label="Panou de întreținere. Trage-l cu mouse-ul sau cu degetul, sau apasă Enter, ca să descoperi compartimentul de dedesubt."
            data-debug="panou"
            onPointerDown={onPanelDown}
            onPointerMove={onPanelMove}
            onPointerUp={onPanelUp}
            onPointerCancel={onPanelUp}
            onKeyDown={onPanelKey}
          >
            <span className="ic"><Lock size={14} /></span>
          </div>

          {imgFail && (
            <div className="mh-imgfail">
              Imaginea lipsește.<br />Pune fișierul în public/mihai/cosmic-room.png
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="mh-modal-bg" onClick={() => setModal(null)}>
          <div className="mh-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="mh-x" onClick={() => setModal(null)} aria-label="Închide"><X size={16} /></button>
            {!imgFail && <ZoomView id={modal} />}
            {renderModal()}
          </div>
        </div>
      )}

      {gameOpen && Game && (
        <div className="mh-gatewrap">
          <div className="mh-gate l" />
          <div className="mh-gate r" />
          <Game onWin={handleWin} onClose={() => setGameOpen(false)} />
        </div>
      )}

      <div className="mh-toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`mh-toast ${t.kind}`}>{t.text}</div>)}
      </div>
    </div>
  );
}
