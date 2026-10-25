import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

/*
  Simulator de luptă (tancuri fictive, teren sci-fi, fără asset-uri externe).
  - 2 valuri de inamici care trag spre tine (cu avertizare vizuală înainte de foc)
  - 3 puncte de armură, reparații între valuri și drop-uri ocazionale
  - obstacolele blochează gloanțele: folosește-le ca adăpost
*/

const W = 640;
const H = 400;
const SIZE = 26;
const MAX_HP = 3;
const COOLDOWN = 0.55; // secunde
const BULLET_SPEED = 260;
const PLAYER_SPEED = 120;
const TEL = 0.7; // cât timp se vede linia de țintire înainte de foc
const INVULN = 1.3;

const OBSTACLES = [
  { x: 150, y: 120, w: 50, h: 50 },
  { x: 430, y: 220, w: 60, h: 50 },
  { x: 290, y: 280, w: 60, h: 30 },
  { x: 70, y: 230, w: 40, h: 60 },
  { x: 540, y: 300, w: 50, h: 40 },
  { x: 250, y: 160, w: 40, h: 40 },
];
const SPAWNS = [
  { x: 80, y: 50 },
  { x: 240, y: 40 },
  { x: 400, y: 45 },
  { x: 560, y: 60 },
  { x: 330, y: 120 },
  { x: 520, y: 150 },
];
const TYPES = {
  scout: { hp: 1, speed: 55, fireMin: 2.8, fireMax: 4.0, bspeed: 135, spread: false, body: '#b5531c', tur: '#ff8a2a' },
  gunner: { hp: 1, speed: 26, fireMin: 2.2, fireMax: 3.2, bspeed: 150, spread: false, body: '#8a2f4a', tur: '#ff4d6d' },
  heavy: { hp: 2, speed: 20, fireMin: 3.2, fireMax: 4.2, bspeed: 120, spread: true, body: '#5b3a8c', tur: '#b58cff' },
};
const WAVES = [
  [{ t: 'gunner', s: 0 }, { t: 'scout', s: 1 }, { t: 'gunner', s: 2 }, { t: 'scout', s: 3 }],
  [{ t: 'heavy', s: 4 }, { t: 'gunner', s: 0 }, { t: 'scout', s: 2 }, { t: 'scout', s: 3 }],
];
const DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];
const HIT_MSGS = ['ȚINTĂ DISTRUSĂ!', 'LOVITURĂ DIRECTĂ!', 'HIT CONFIRMAT!', 'UN INAMIC MAI PUȚIN!', 'PRECIZIE PERFECTĂ!'];
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 97) % W,
  y: (i * 53 + 17) % H,
  r: i % 3 === 0 ? 1.5 : 1,
}));

const rnd = (a, b) => a + Math.random() * (b - a);

function blocked(cx, cy) {
  const h = SIZE / 2;
  if (cx - h < 0 || cy - h < 0 || cx + h > W || cy + h > H) return true;
  return OBSTACLES.some(
    (o) => cx + h > o.x && cx - h < o.x + o.w && cy + h > o.y && cy - h < o.y + o.h
  );
}

function spawnWave(g, i) {
  g.wave = i;
  g.bots = WAVES[i].map(({ t, s }, k) => {
    const ty = TYPES[t];
    return {
      ...SPAWNS[s],
      type: t,
      hp: ty.hp,
      dir: DIRS[k % 4],
      t: 0.5 + k * 0.3,
      fire: 1.8 + rnd(ty.fireMin, ty.fireMax),
      aim: null,
      hitFlash: 0,
      alive: true,
    };
  });
}

function makeState() {
  const g = {
    player: { x: 320, y: 360, dir: { x: 0, y: -1 } },
    hp: MAX_HP,
    inv: 0,
    bots: [],
    bullets: [],
    ebullets: [],
    parts: [],
    pickups: [],
    cd: 0,
    msg: 'VALUL 1',
    msgT: 1.6,
    wave: 0,
    clearing: false,
    waveDelay: 0,
    won: false,
    lost: false,
    winCalled: false,
    flash: 0,
    shake: 0,
    time: 0,
  };
  spawnWave(g, 0);
  return g;
}

function burst(g, x, y, n, colors, speed, life) {
  for (let i = 0; i < n; i++) {
    g.parts.push({
      x, y,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      life,
      c: colors[i % colors.length],
    });
  }
}

function drawTank(ctx, x, y, dir, body, turret, scale = 1) {
  const ang = Math.atan2(dir.y, dir.x);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(-14, -15, 28, 7);
  ctx.fillRect(-14, 8, 28, 7);
  ctx.fillStyle = body;
  ctx.fillRect(-12, -11, 24, 22);
  ctx.fillStyle = turret;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(0, -2, 20, 4);
  ctx.restore();
}

export default function MihaiGame({ onWin, onClose }) {
  const cvRef = useRef(null);
  const gRef = useRef(makeState());
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const onWinRef = useRef(onWin);
  const hudKey = useRef('');
  const [hud, setHud] = useState({ hp: MAX_HP, left: WAVES[0].length, wave: 1, cd: 1, msg: 'VALUL 1', won: false, lost: false });

  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);

  const fire = useCallback((target) => {
    const g = gRef.current;
    if (g.won || g.lost || g.cd > 0) return;
    const p = g.player;
    let d = p.dir;
    if (target) {
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      d = { x: dx / len, y: dy / len };
      p.dir = d;
    }
    g.bullets.push({ x: p.x + d.x * 20, y: p.y + d.y * 20, vx: d.x * BULLET_SPEED, vy: d.y * BULLET_SPEED });
    g.cd = COOLDOWN;
    g.flash = 0.08;
  }, []);

  const retry = useCallback(() => {
    gRef.current = makeState();
    keys.current = { up: false, down: false, left: false, right: false };
    hudKey.current = '';
  }, []);

  // tastatură
  useEffect(() => {
    const map = {
      w: 'up', arrowup: 'up',
      s: 'down', arrowdown: 'down',
      a: 'left', arrowleft: 'left',
      d: 'right', arrowright: 'right',
    };
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (map[k]) { keys.current[map[k]] = true; e.preventDefault(); }
      else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) fire(); }
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (map[k]) keys.current[map[k]] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [fire]);

  // bucla jocului
  useEffect(() => {
    const canvas = cvRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();

    const damagePlayer = (g) => {
      if (g.inv > 0 || g.won || g.lost) return;
      g.hp -= 1;
      g.inv = INVULN;
      g.shake = 0.25;
      burst(g, g.player.x, g.player.y, 14, ['#ff4d6d', '#ffd48a'], 200, 0.5);
      if (g.hp <= 0) {
        g.hp = 0;
        g.lost = true;
        g.ebullets = [];
        g.msg = 'ARMURĂ DISTRUSĂ';
        g.msgT = 99;
      } else {
        g.msg = g.hp === 1 ? 'ARMURĂ CRITICĂ!' : 'ARMURĂ LOVITĂ!';
        g.msgT = 1.2;
      }
    };

    const step = (dt) => {
      const g = gRef.current;
      const k = keys.current;
      g.time += dt;
      if (g.cd > 0) g.cd = Math.max(0, g.cd - dt);
      if (g.msgT > 0 && !g.lost) g.msgT -= dt;
      if (g.flash > 0) g.flash -= dt;
      if (g.inv > 0) g.inv -= dt;
      if (g.shake > 0) g.shake -= dt;
      const p = g.player;

      // jucător
      if (!g.won && !g.lost) {
        const mx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
        const my = (k.down ? 1 : 0) - (k.up ? 1 : 0);
        if (mx || my) {
          const len = Math.hypot(mx, my);
          p.dir = { x: mx / len, y: my / len };
          const nx = p.x + (mx / len) * PLAYER_SPEED * dt;
          const ny = p.y + (my / len) * PLAYER_SPEED * dt;
          if (!blocked(nx, p.y)) p.x = nx;
          if (!blocked(p.x, ny)) p.y = ny;
        }
      }

      // inamici
      if (!g.won && !g.lost) {
        g.bots.forEach((b) => {
          if (!b.alive) return;
          const ty = TYPES[b.type];
          if (b.hitFlash > 0) b.hitFlash -= dt;
          const telegraphing = b.fire <= TEL;

          // mișcare (se oprește când țintește, ca să fie lizibil)
          if (!telegraphing) {
            b.t -= dt;
            const nx = b.x + b.dir.x * ty.speed * dt;
            const ny = b.y + b.dir.y * ty.speed * dt;
            if (b.t <= 0 || blocked(nx, ny)) {
              if (b.type === 'scout' && Math.random() < 0.45) {
                const dx = p.x - b.x;
                const dy = p.y - b.y;
                b.dir = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
              } else {
                b.dir = DIRS[Math.floor(Math.random() * 4)];
              }
              b.t = rnd(0.8, 2.2);
            } else {
              b.x = nx;
              b.y = ny;
            }
          }

          // foc
          b.fire -= dt;
          if (b.fire <= TEL && !b.aim) {
            const dx = p.x - b.x;
            const dy = p.y - b.y;
            const len = Math.hypot(dx, dy) || 1;
            b.aim = { x: dx / len, y: dy / len };
          }
          if (b.fire <= 0) {
            const angles = ty.spread ? [-0.3, 0, 0.3] : [0];
            angles.forEach((a) => {
              const c = Math.cos(a);
              const s = Math.sin(a);
              const dx = b.aim.x * c - b.aim.y * s;
              const dy = b.aim.x * s + b.aim.y * c;
              g.ebullets.push({ x: b.x + dx * 20, y: b.y + dy * 20, vx: dx * ty.bspeed, vy: dy * ty.bspeed });
            });
            b.aim = null;
            b.fire = rnd(ty.fireMin, ty.fireMax);
          }
        });
      }

      // gloanțele jucătorului
      g.bullets = g.bullets.filter((bl) => {
        bl.x += bl.vx * dt;
        bl.y += bl.vy * dt;
        if (bl.x < 0 || bl.y < 0 || bl.x > W || bl.y > H) return false;
        if (OBSTACLES.some((o) => bl.x > o.x && bl.x < o.x + o.w && bl.y > o.y && bl.y < o.y + o.h)) {
          burst(g, bl.x, bl.y, 5, ['#8fa3c7'], 80, 0.35);
          return false;
        }
        const hit = g.bots.find((b) => b.alive && Math.abs(b.x - bl.x) < SIZE / 2 + 3 && Math.abs(b.y - bl.y) < SIZE / 2 + 3);
        if (hit) {
          hit.hp -= 1;
          hit.hitFlash = 0.15;
          if (hit.hp <= 0) {
            hit.alive = false;
            g.msg = HIT_MSGS[Math.floor(Math.random() * HIT_MSGS.length)];
            g.msgT = 1.2;
            burst(g, hit.x, hit.y, 18, ['#ff8a2a', '#ffd48a'], 220, 0.6);
            if (g.hp < MAX_HP && Math.random() < 0.3) g.pickups.push({ x: hit.x, y: hit.y, life: 8 });
          } else {
            g.msg = 'BLINDAJ CRĂPAT!';
            g.msgT = 1;
            burst(g, bl.x, bl.y, 8, ['#b58cff', '#fff'], 120, 0.4);
          }
          return false;
        }
        return true;
      });

      // gloanțele inamicilor
      g.ebullets = g.ebullets.filter((bl) => {
        bl.x += bl.vx * dt;
        bl.y += bl.vy * dt;
        if (bl.x < 0 || bl.y < 0 || bl.x > W || bl.y > H) return false;
        if (OBSTACLES.some((o) => bl.x > o.x && bl.x < o.x + o.w && bl.y > o.y && bl.y < o.y + o.h)) {
          burst(g, bl.x, bl.y, 4, ['#ff4d6d'], 70, 0.3);
          return false;
        }
        if (Math.abs(p.x - bl.x) < SIZE / 2 + 3 && Math.abs(p.y - bl.y) < SIZE / 2 + 3) {
          damagePlayer(g);
          return false;
        }
        return true;
      });

      // reparații
      g.pickups = g.pickups.filter((pk) => {
        pk.life -= dt;
        if (pk.life <= 0) return false;
        if (!g.won && !g.lost && Math.hypot(p.x - pk.x, p.y - pk.y) < 20) {
          if (g.hp < MAX_HP) g.hp += 1;
          g.msg = 'REPARAȚII +1';
          g.msgT = 1.2;
          burst(g, pk.x, pk.y, 10, ['#3dff9a', '#fff'], 120, 0.5);
          return false;
        }
        return true;
      });

      // particule
      g.parts = g.parts.filter((pt) => {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        return pt.life > 0;
      });

      // valuri / victorie
      const left = g.bots.filter((b) => b.alive).length;
      if (left === 0 && !g.won && !g.lost && !g.clearing) {
        if (g.wave < WAVES.length - 1) {
          g.clearing = true;
          g.waveDelay = 1.8;
          g.ebullets = [];
          if (g.hp < MAX_HP) g.hp += 1;
          g.msg = 'VAL CURĂȚAT! +1 ARMURĂ';
          g.msgT = 1.8;
        } else {
          g.won = true;
          g.ebullets = [];
          if (!g.winCalled) {
            g.winCalled = true;
            if (typeof onWinRef.current === 'function') onWinRef.current();
          }
        }
      }
      if (g.clearing) {
        g.waveDelay -= dt;
        if (g.waveDelay <= 0) {
          g.clearing = false;
          spawnWave(g, g.wave + 1);
          g.msg = `VALUL ${g.wave + 1} · ATENȚIE, BLINDATE!`;
          g.msgT = 1.8;
        }
      }

      // HUD (doar când se schimbă)
      const cdVal = g.cd > 0 ? 1 - g.cd / COOLDOWN : 1;
      const msg = g.msgT > 0 ? g.msg : '';
      const key = `${g.hp}|${left}|${g.wave}|${Math.round(cdVal * 20)}|${msg}|${g.won}|${g.lost}`;
      if (key !== hudKey.current) {
        hudKey.current = key;
        setHud({ hp: g.hp, left, wave: g.wave + 1, cd: cdVal, msg, won: g.won, lost: g.lost });
      }
    };

    const draw = () => {
      const g = gRef.current;
      ctx.save();
      if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#071433');
      grad.addColorStop(1, '#0a1f2a');
      ctx.fillStyle = grad;
      ctx.fillRect(-10, -10, W + 20, H + 20);
      STARS.forEach((s) => {
        ctx.fillStyle = 'rgba(180,220,255,.45)';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });
      ctx.strokeStyle = 'rgba(34,230,255,.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      OBSTACLES.forEach((o) => {
        ctx.fillStyle = '#1b2740';
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = '#5b6b8c';
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = '#ff8a2a';
        ctx.fillRect(o.x + 4, o.y + 4, 6, 6);
      });

      // reparații
      g.pickups.forEach((pk) => {
        if (pk.life < 2 && Math.floor(g.time * 8) % 2) return;
        ctx.fillStyle = 'rgba(61,255,154,.25)';
        ctx.fillRect(pk.x - 12, pk.y - 12, 24, 24);
        ctx.strokeStyle = '#3dff9a';
        ctx.lineWidth = 2;
        ctx.strokeRect(pk.x - 10, pk.y - 10, 20, 20);
        ctx.fillStyle = '#3dff9a';
        ctx.fillRect(pk.x - 6, pk.y - 2, 12, 4);
        ctx.fillRect(pk.x - 2, pk.y - 6, 4, 12);
      });

      // linii de țintire (avertizare)
      g.bots.forEach((b) => {
        if (!b.alive || !b.aim) return;
        const a = 0.35 + 0.35 * Math.sin(g.time * 30);
        ctx.strokeStyle = `rgba(255,77,109,${a})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        const angles = TYPES[b.type].spread ? [-0.3, 0, 0.3] : [0];
        angles.forEach((an) => {
          const c = Math.cos(an);
          const s = Math.sin(an);
          const dx = b.aim.x * c - b.aim.y * s;
          const dy = b.aim.x * s + b.aim.y * c;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + dx * 180, b.y + dy * 180);
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff4d6d';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('!', b.x - 3, b.y - 20);
      });

      // inamici
      g.bots.forEach((b) => {
        if (!b.alive) return;
        const ty = TYPES[b.type];
        const scale = b.type === 'heavy' ? 1.2 : 1;
        drawTank(ctx, b.x, b.y, b.aim || b.dir, b.hitFlash > 0 ? '#fff' : ty.body, ty.tur, scale);
        if (ty.hp > 1) {
          for (let i = 0; i < ty.hp; i++) {
            ctx.fillStyle = i < b.hp ? '#b58cff' : '#2a2f3d';
            ctx.fillRect(b.x - 10 + i * 11, b.y - 24, 9, 4);
          }
        }
      });

      // jucător (clipește când e invulnerabil)
      if (!(g.inv > 0 && Math.floor(g.time * 16) % 2) && !g.lost) {
        drawTank(ctx, g.player.x, g.player.y, g.player.dir, '#1486a8', '#22e6ff');
      }
      if (g.flash > 0) {
        ctx.fillStyle = 'rgba(255,240,180,.9)';
        ctx.beginPath();
        ctx.arc(g.player.x + g.player.dir.x * 26, g.player.y + g.player.dir.y * 26, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      g.bullets.forEach((bl) => {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#22e6ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      g.ebullets.forEach((bl) => {
        ctx.fillStyle = '#ff4d6d';
        ctx.shadowColor = '#ff4d6d';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      g.parts.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life * 1.6);
        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x, pt.y, 3, 3);
      });
      ctx.globalAlpha = 1;

      if (g.inv > INVULN - 0.2) {
        ctx.fillStyle = 'rgba(255,40,80,.18)';
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onCanvasPointer = (e) => {
    const r = cvRef.current.getBoundingClientRect();
    fire({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
  };

  const hold = (name) => ({
    onPointerDown: (e) => { e.preventDefault(); keys.current[name] = true; },
    onPointerUp: () => { keys.current[name] = false; },
    onPointerLeave: () => { keys.current[name] = false; },
    onPointerCancel: () => { keys.current[name] = false; },
  });

  return (
    <div className="mg-root">
      <div className="mg-hud">
        <div className="mg-cell">
          ARMURĂ
          <b className="mg-hearts" aria-label={`Armură ${hud.hp} din ${MAX_HP}`}>
            {'♥'.repeat(hud.hp)}<span style={{ opacity: 0.25 }}>{'♥'.repeat(MAX_HP - hud.hp)}</span>
          </b>
        </div>
        <div className="mg-cell o">VALUL {hud.wave}/{WAVES.length}<b>{hud.left} inamici</b></div>
        <div className="mg-cell">
          COOLDOWN {hud.cd >= 1 ? '· GATA' : '· ÎNCARCĂ'}
          <div className="mg-bar"><i style={{ width: `${Math.round(hud.cd * 100)}%` }} /></div>
        </div>
        <div className="mg-cell">
          <button type="button" className="mh-btn hot" style={{ padding: '4px 8px', clipPath: 'none' }} onClick={() => onClose && onClose()}>
            <ArrowLeft size={14} /> Înapoi în cameră
          </button>
        </div>
      </div>

      <div className="mg-field">
        <canvas ref={cvRef} width={W} height={H} onPointerDown={onCanvasPointer} />
        {hud.msg && !hud.won && !hud.lost && <div className="mg-msg">{hud.msg}</div>}
        {hud.won && (
          <div className="mg-win">
            <div>
              <h2>SIMULARE REUȘITĂ</h2>
              <p>Ai supraviețuit ambelor valuri și ai distrus toți inamicii. Fragmentul criptat a fost câștigat și decriptat — te așteaptă în sertarul camerei.</p>
              <button type="button" className="mh-btn" onClick={() => onClose && onClose()}>
                <ArrowLeft size={14} /> Înapoi în cameră
              </button>
            </div>
          </div>
        )}
        {hud.lost && (
          <div className="mg-win mg-lose">
            <div>
              <h2>ARMURĂ DISTRUSĂ</h2>
              <p>Ai ajuns la valul {hud.wave}. Folosește obstacolele ca adăpost, urmărește liniile roșii și mută-te înainte să tragă.</p>
              <button type="button" className="mh-btn hot" onClick={retry}>
                <RotateCcw size={14} /> Reîncearcă
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mg-help">WASD / săgeți = mișcare · Space sau click/tap pe teren = foc · linia roșie intermitentă = inamicul e pe cale să tragă · obstacolele opresc gloanțele · pătratele verzi = reparații.</div>

      <div className="mg-touch">
        <div className="mg-pad">
          <button type="button" className="mg-key up" {...hold('up')}>▲</button>
          <button type="button" className="mg-key left" {...hold('left')}>◀</button>
          <button type="button" className="mg-key down" {...hold('down')}>▼</button>
          <button type="button" className="mg-key right" {...hold('right')}>▶</button>
        </div>
        <button
          type="button"
          className="mg-key mg-fire"
          onPointerDown={(e) => { e.preventDefault(); fire(); }}
        >
          FOC
        </button>
      </div>
    </div>
  );
}
