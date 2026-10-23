// Effekterna i rubrikvalet. Varje rubrik har sin egen: ljusfart för den första,
// myntregn och kassaapparat för pengarna, en mur som rasar för möjligheterna,
// en publik som gör vågen för människorna, pratbubblor för intervjun och en
// kedja som brister för skillnaden.
// Mynt och figurer ritas med spelets egna pixelritare, så det är samma värld.

import './effects.css';
import { renderCoinCanvas, renderPixelCanvas } from '../pixelart.js';
import { renderAvatarCanvas } from '../avatars.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function makeLayer(ms) {
  const layer = document.createElement('div');
  layer.className = 'fx';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), ms);
  return layer;
}

function center(el) {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2, box };
}

function sprite(canvas, x, y, layer) {
  const img = document.createElement('img');
  img.src = canvas.toDataURL();
  img.width = canvas.width;
  img.height = canvas.height;
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  layer.appendChild(img);
  return img;
}

let coinCanvas;

// Mynt regnar ner, snurrar och studsar mot skärmkanten, medan en
// kassaapparat räknar upp till 100 000 kr och säger ka-ching.
function coins(from) {
  const { x, box } = center(from);
  const layer = makeLayer(3200);
  coinCanvas ??= renderCoinCanvas('#e0b23c', 4);

  const count = Math.min(40, Math.round(innerWidth / 14));
  for (let i = 0; i < count; i++) {
    const coin = sprite(coinCanvas, Math.random() * (innerWidth - 28), -32, layer);
    const floor = innerHeight - 28 - Math.random() * 40;
    coin.animate(
      [
        { transform: 'translateY(0) scaleX(1)', offset: 0 },
        { transform: `translateY(${floor * 0.5}px) scaleX(-1)`, offset: 0.3 },
        { transform: `translateY(${floor}px) scaleX(1)`, offset: 0.55 },
        { transform: `translateY(${floor - 60}px) scaleX(-1)`, offset: 0.7 },
        { transform: `translateY(${floor}px) scaleX(1)`, offset: 0.85, opacity: 1 },
        { transform: `translateY(${floor - 14}px) scaleX(-1)`, opacity: 0 },
      ],
      { duration: 1700 + Math.random() * 600, delay: Math.random() * 700, easing: 'steps(24, end)', fill: 'backwards' },
    );
  }

  const till = document.createElement('div');
  till.className = 'fx-till';
  till.innerHTML = '<span class="fx-till-kr">0</span><span class="fx-till-unit">kr</span>';
  till.style.left = `${Math.min(Math.max(x, 110), innerWidth - 110)}px`;
  till.style.top = `${Math.max(box.top - 70, 70)}px`;
  layer.appendChild(till);
  till.animate(
    [
      { transform: 'translate(-50%, 20px) scale(0.4)', opacity: 0 },
      { transform: 'translate(-50%, 0) scale(1.1)', opacity: 1, offset: 0.08 },
      { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: 0.12 },
      { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: 0.85 },
      { transform: 'translate(-50%, -30px) scale(1)', opacity: 0 },
    ],
    { duration: 2600, easing: 'steps(20, end)', fill: 'forwards' },
  );

  const kr = till.querySelector('.fx-till-kr');
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start - 250) / 1100);
    if (t < 0) return requestAnimationFrame(tick);
    const value = Math.round((1 - (1 - t) ** 3) * 100000 / 1000) * 1000;
    kr.textContent = value.toLocaleString('sv-SE');
    if (t < 1) requestAnimationFrame(tick);
    else {
      till.classList.add('ching');
      const word = document.createElement('div');
      word.className = 'fx-word';
      word.textContent = 'Ka-ching!';
      till.appendChild(word);
    }
  };
  requestAnimationFrame(tick);
}

// Ett eget canvaslager ovanpå sidan. Det har ingen bakgrund, så varken sidan
// eller webbläsarens verktygsfält färgas av det som ritas, och det tas bort
// när effekten är klar. draw(ctx, t) ritar en bildruta och svarar false när
// den är färdig.
function canvasLayer(draw) {
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
  const start = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (draw(ctx, now - start) === false) canvas.remove();
    else requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Rutnät på 4 px, så att allt som rör sig hamnar på pixlar som i spelet.
const snap = (v) => Math.round(v / 4) * 4;

// Spelets pixelföremål för det som blir möjligt. Varje tecken är en pixel.
const OBJECTS = {
  rocket: {
    rows: ['...W...', '..WWW..', '..WBW..', '..WWW..', '.RWWWR.', 'RR.W.RR', '...O...'],
    palette: { W: '#f1f5f9', B: '#4f7fd6', R: '#ef4444', O: '#f97316' },
  },
  bulb: {
    rows: ['..YYY..', '.YYWYY.', '.YYYYY.', '.YYYYY.', '..YYY..', '..GGG..', '...G...'],
    palette: { Y: '#fde047', W: '#ffffff', G: '#8b95a8' },
  },
  globe: {
    rows: ['..BBB..', '.BGGBB.', 'BGGBBGB', 'BBGBBGB', 'BBBBGGB', '.BBBGB.', '..BBB..'],
    palette: { B: '#4f7fd6', G: '#3fbf7f' },
  },
  star: {
    rows: ['...Y...', '...Y...', '..YWY..', 'YYWWWYY', '..YWY..', '...Y...', '...Y...'],
    palette: { Y: '#c4b5fd', W: '#ffffff' },
  },
};
const objectCanvases = {};

function objectCanvas(name) {
  objectCanvases[name] ??= renderPixelCanvas(OBJECTS[name].rows, OBJECTS[name].palette, 4);
  return objectCanvases[name];
}

// Möjligheterna: en mur av pixelstenar byggs upp framför blocket, spricker,
// och rasar. Genom hålet strömmar ljus, och ut ur det flyger det som blir
// möjligt: en raket som skjuter rakt upp, glödlampor, jordklot och stjärnor.
// Bakom muren fanns något man inte såg förut.
function breakthrough(from) {
  const { x, y } = center(from);
  const cols = 7;
  const rows = 6;
  const bw = 32;
  const bh = 16;
  const left = snap(x - (cols * bw) / 2);
  const top = snap(y - (rows * bh) / 2);

  const bricks = [];
  for (let r = 0; r < rows; r++) {
    // Varannan rad förskjuten en halv sten, som en riktig mur.
    const shift = r % 2 ? bw / 2 : 0;
    for (let c = 0; c < cols + (r % 2); c++) {
      const bx = left + c * bw - shift;
      const w = Math.min(bw, left + cols * bw - bx) - (bx < left ? left - bx : 0);
      if (w <= 4) continue;
      const cx = Math.max(bx, left);
      const dx = cx + w / 2 - x;
      const dy = top + r * bh + bh / 2 - y;
      bricks.push({
        x: cx, y: top + r * bh, w: w - 4, appear: r * 40 + Math.random() * 60,
        vx: dx * (0.004 + Math.random() * 0.004), vy: dy * 0.004 - 0.25 - Math.random() * 0.2,
        shade: ['#5b6478', '#4a5266', '#6b7488'][(r + c) % 3],
      });
    }
  }

  // Sprickor som växer ut från mitten i små pixelsteg.
  const cracks = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
    const path = [];
    let px = x;
    let py = y;
    for (let k = 0; k < 18; k++) {
      px += Math.cos(angle) * 6 + (Math.random() - 0.5) * 8;
      py += Math.sin(angle) * 6 + (Math.random() - 0.5) * 8;
      path.push([snap(px), snap(py)]);
    }
    return path;
  });

  const kinds = ['rocket', 'bulb', 'globe', 'star', 'bulb', 'globe', 'star', 'rocket', 'globe', 'bulb'];
  const things = kinds.map((kind, i) => {
    const angle = -Math.PI / 2 + (i / (kinds.length - 1) - 0.5) * Math.PI * 1.3;
    const power = 0.45 + Math.random() * 0.35;
    return { kind, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power - 0.15, delay: 760 + i * 45 };
  });

  const BUILD = 380;
  const BREAK = 760;

  canvasLayer((ctx, t) => {
    // Ljuset bakom muren, synligt i sprickorna och sedan genom hålet.
    if (t > BUILD) {
      const open = Math.min(1, Math.max(0, (t - BREAK + 200) / 500));
      const fade = t < 1900 ? 1 : Math.max(0, 1 - (t - 1900) / 500);
      const radius = 60 + open * 260;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t / 1600);
      for (let k = 0; k < 12; k++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.globalAlpha = (k % 2 ? 0.35 : 0.6) * fade * (0.3 + open * 0.7);
        const ray = ctx.createLinearGradient(0, 0, radius, 0);
        ray.addColorStop(0, '#ffffff');
        ray.addColorStop(0.3, '#fde047');
        ray.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = ray;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, -radius * 0.12);
        ctx.lineTo(radius, radius * 0.12);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = fade * (0.4 + open * 0.6);
      ctx.fillStyle = '#ffffff';
      const core = snap(8 + open * 28);
      ctx.fillRect(x - core / 2, y - core / 2, core, core);
      ctx.globalAlpha = 1;
    }

    // Muren: byggs upp, skakar, rasar.
    const shake = t > BUILD + 150 && t < BREAK ? snap((Math.random() - 0.5) * 6) : 0;
    for (const b of bricks) {
      if (t < b.appear) continue;
      let bx = b.x + shake;
      let by = b.y;
      let alpha = 1;
      if (t > BREAK) {
        const f = t - BREAK;
        bx += b.vx * f;
        by += b.vy * f + 0.0011 * f * f;
        alpha = Math.max(0, 1 - f / 900);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = b.shade;
      ctx.fillRect(snap(bx), snap(by), b.w, bh - 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(snap(bx), snap(by), b.w, 4);
    }
    ctx.globalAlpha = 1;

    // Sprickorna lyser av ljuset bakom.
    if (t > BUILD && t < BREAK + 60) {
      const grow = Math.min(1, (t - BUILD) / (BREAK - BUILD - 100));
      ctx.fillStyle = '#fff7c2';
      for (const path of cracks) {
        const n = Math.ceil(path.length * grow);
        for (let k = 0; k < n; k++) ctx.fillRect(path[k][0], path[k][1], 4, 4);
      }
    }

    // Det som blir möjligt flyger ut ur hålet.
    let alive = t < 2400;
    for (const o of things) {
      const f = t - o.delay;
      if (f < 0) continue;
      const img = objectCanvas(o.kind);
      const scale = Math.min(1.5, 0.6 + f / 400);
      const size = snap(28 * scale);
      let ox;
      let oy;
      if (o.kind === 'rocket') {
        // Raketen skjuter rakt upp och accelererar, med en flamma efter sig.
        ox = x + o.vx * f * 0.4;
        oy = y - 0.0009 * f * f - 0.2 * f;
        ctx.fillStyle = '#f97316';
        for (let k = 0; k < 4; k++) ctx.fillRect(snap(ox - 2), snap(oy + size / 2 + k * 8), 4, 4);
      } else {
        ox = x + o.vx * f;
        oy = y + o.vy * f + 0.0004 * f * f;
      }
      if (oy > -40 && oy < innerHeight + 40 && f < 2000) alive = true;
      ctx.globalAlpha = f > 1300 ? Math.max(0, 1 - (f - 1300) / 500) : 1;
      ctx.drawImage(img, snap(ox - size / 2), snap(oy - size / 2), size, size);
    }
    ctx.globalAlpha = 1;
    return alive && t < 3200;
  });
}

const BIRD = [
  ['B.......B', 'BB.....BB', '.BBBEBBB.', '...BBB...'],
  ['...BBB...', '.BBBEBBB.', 'BB.....BB', 'B.......B'],
];
const birdCanvases = [];

// Skillnaden: en kedja spänns över blocket, skakar och brister. Länkarna
// faller, och ur blocket flyger en flock fåglar iväg upp mot kanten. Frihet,
// inte beroende.
function freedom(from) {
  const { x, y } = center(from);
  if (!birdCanvases.length) {
    for (const frame of BIRD) birdCanvases.push(renderPixelCanvas(frame, { B: '#f1f5f9', E: '#e0b23c' }, 6));
  }
  const linkW = 20;
  const links = [];
  for (let lx = -linkW; lx < innerWidth + linkW; lx += linkW) {
    const side = lx + linkW / 2 < x ? -1 : 1;
    const near = Math.abs(lx + linkW / 2 - x);
    links.push({
      x: lx, side, near,
      vx: side * (0.15 + Math.random() * 0.25) * (1 - Math.min(near, 300) / 400),
      vy: -0.2 - Math.random() * 0.3,
      vertical: (lx / linkW) % 2 === 0,
    });
  }
  const flock = Array.from({ length: 5 }, (_, i) => ({
    delay: 700 + i * 110,
    dx: (i - 2) * 22,
    drift: 0.08 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
  }));

  const PULL = 300;
  const SNAP = 700;
  const heading = x > innerWidth / 2 ? -1 : 1;

  canvasLayer((ctx, t) => {
    // Kedjan glider in från båda sidor, spänns och skakar mer och mer.
    const slide = Math.min(1, t / PULL);
    const shake = t > PULL && t < SNAP ? ((t - PULL) / (SNAP - PULL)) * 6 : 0;
    for (const l of links) {
      let lx = l.x + l.side * (1 - slide) * innerWidth * 0.5;
      let ly = y + snap((Math.random() - 0.5) * shake);
      let alpha = 1;
      if (t > SNAP) {
        const f = t - SNAP;
        lx += l.vx * f * (l.near < 120 ? 2.5 : 1);
        ly += l.vy * f * (l.near < 120 ? 1 : 0.2) + 0.0012 * f * f;
        alpha = Math.max(0, 1 - f / 1100);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#8b95a8';
      if (l.vertical) {
        ctx.fillRect(snap(lx + 6), snap(ly - 8), 8, 4);
        ctx.fillRect(snap(lx + 6), snap(ly + 4), 8, 4);
        ctx.fillRect(snap(lx + 4), snap(ly - 4), 4, 8);
        ctx.fillRect(snap(lx + 12), snap(ly - 4), 4, 8);
      } else {
        ctx.fillRect(snap(lx - 2), snap(ly - 4), 24, 4);
        ctx.fillRect(snap(lx - 2), snap(ly + 4), 24, 4);
        ctx.fillStyle = '#c3cad6';
        ctx.fillRect(snap(lx), snap(ly - 4), 8, 4);
      }
    }
    ctx.globalAlpha = 1;

    // Gnistor där kedjan brister.
    if (t > SNAP && t < SNAP + 400) {
      const f = (t - SNAP) / 400;
      ctx.fillStyle = '#fde047';
      for (let k = 0; k < 12; k++) {
        const a = (Math.PI * 2 * k) / 12;
        ctx.globalAlpha = 1 - f;
        ctx.fillRect(snap(x + Math.cos(a) * f * 60), snap(y + Math.sin(a) * f * 60), 4, 4);
      }
      ctx.globalAlpha = 1;
    }

    // Fåglarna lyfter och flaxar iväg uppåt i en båge, in över skärmen så att
    // de syns hela vägen även när blocket står vid kanten.
    let alive = t < 1500;
    for (const b of flock) {
      const f = t - b.delay;
      if (f < 0) continue;
      const bx = x + b.dx + f * b.drift * heading + Math.sin(f / 300 + b.phase) * 12;
      const by = y - f * 0.32 - 0.00008 * f * f;
      if (by > -40) alive = true;
      const frame = birdCanvases[Math.floor(f / 120) % 2];
      ctx.drawImage(frame, snap(bx - 27), snap(by - 12));
    }
    return alive && t < 4000;
  });
}

// Visionen: framtiden öppnar sig. Ett stjärnfält rusar ut ur rubriken som
// när ett rymdskepp går upp i ljusfart, en ljusstråle sveper över rubriken
// och lämnar gnistor efter sig, och stjärnorna blir kvar en stund och
// blinkar innan de släcks. Spelas när sidan öppnas och när man väljer 1.
const WARP_COLORS = ['#ffffff', '#fde047', '#c4b5fd', '#e0b23c', '#3fbf7f', '#4f7fd6'];

export function vision(title, { reveal = false } = {}) {
  if (reducedMotion.matches || !title) return;
  const box = title.getBoundingClientRect();
  if (box.bottom < 0 || box.top > innerHeight) return;
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const far = Math.hypot(innerWidth, innerHeight);

  const warp = Array.from({ length: Math.min(160, Math.max(90, Math.round(innerWidth / 6))) }, (_, i) => ({
    angle: Math.random() * Math.PI * 2,
    start: 10 + Math.random() * 60,
    speed: 0.6 + Math.random() * 0.8,
    stop: 0.08 + Math.random() * 0.5,
    color: WARP_COLORS[i % WARP_COLORS.length],
    twinkle: Math.random() * Math.PI * 2,
  }));
  const sparks = [];
  const sweepStart = 700;
  const sweepTime = 750;
  const x0 = box.left - 40;
  const x1 = box.right + 40;

  // Rubriken tänds bakom strålen, bokstav för bokstav.
  if (reveal) {
    title.animate(
      [{ clipPath: 'inset(-20px 100% -20px -20px)' }, { clipPath: 'inset(-20px -20px -20px -20px)' }],
      { duration: sweepTime, delay: sweepStart, easing: 'steps(16, end)', fill: 'backwards' },
    );
  }

  canvasLayer((ctx, t) => {
    // Ljusfarten: strecken sträcks ut från rubriken och stannar sedan på
    // olika avstånd som en stjärnhimmel.
    const go = Math.min(1, t / 1100);
    const fade = t < 2400 ? 1 : Math.max(0, 1 - (t - 2400) / 600);
    for (const s of warp) {
      const p = Math.min(go * s.speed * 1.6, 1);
      const reach = s.start + (far * s.stop) * (1 - (1 - p) ** 3);
      const tail = go < 1 ? Math.min(reach - s.start, 160 * (1 - p)) : 0;
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);
      const blink = go < 1 ? 1 : 0.4 + 0.6 * Math.abs(Math.sin(t / 180 + s.twinkle));
      ctx.globalAlpha = fade * blink;
      ctx.fillStyle = s.color;
      for (let d = reach - tail; d <= reach; d += 6) {
        ctx.fillRect(snap(cx + cos * d), snap(cy + sin * d), 4, 4);
      }
    }

    // Ljusstrålen sveper över rubriken från vänster till höger.
    const sp = (t - sweepStart) / sweepTime;
    if (sp >= 0 && sp <= 1) {
      const bx = snap(x0 + (x1 - x0) * sp);
      const top = box.top - 20;
      const h = box.height + 40;
      ctx.globalAlpha = 1;
      const trail = ctx.createLinearGradient(bx - 120, 0, bx, 0);
      trail.addColorStop(0, 'rgba(253, 224, 71, 0)');
      trail.addColorStop(1, 'rgba(253, 224, 71, 0.45)');
      ctx.fillStyle = trail;
      ctx.fillRect(bx - 120, top, 120, h);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bx, top, 8, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 2, top, 4, h);
      for (let k = 0; k < 3; k++) {
        sparks.push({ x: bx, y: top + Math.random() * h, vx: -0.05 - Math.random() * 0.1, vy: -0.08 + Math.random() * 0.16, born: t, color: WARP_COLORS[(Math.random() * 3) | 0] });
      }
    }

    for (const sp2 of sparks) {
      const age = (t - sp2.born) / 700;
      if (age > 1) continue;
      ctx.globalAlpha = 1 - age;
      ctx.fillStyle = sp2.color;
      ctx.fillRect(snap(sp2.x + sp2.vx * (t - sp2.born)), snap(sp2.y + sp2.vy * (t - sp2.born)), 4, 4);
    }
    ctx.globalAlpha = 1;
    return t < 3000;
  });
}

// Samma figurer som i spelet, i en blandning som speglar dem som spelar.
const CROWD = ['vd', 'reception', 'cio', 'medarbetare', 'hr', 'maklare', 'entreprenor', 'chef', 'dataai', 'event', 'teamledare', 'hotelldirektor', 'foretag', 'hotellchef'];
const crowdCanvases = new Map();

// En publik reser sig längst ner, gör vågen två varv och applåderar.
function crowd() {
  const layer = makeLayer(3600);
  const scale = innerWidth < 600 ? 4 : 5;
  const step = 10 * scale + 6;
  const count = Math.ceil(innerWidth / step) + 1;
  const offset = (innerWidth - count * step) / 2;

  for (let i = 0; i < count; i++) {
    const id = CROWD[i % CROWD.length];
    const key = `${id}-${scale}`;
    if (!crowdCanvases.has(key)) crowdCanvases.set(key, renderAvatarCanvas(id, scale));
    const person = sprite(crowdCanvases.get(key), offset + i * step, innerHeight, layer);
    const h = 14 * scale;

    // Upp ur skärmkanten, sedan ner igen när festen är över.
    person.animate(
      [
        { transform: 'translateY(0)' },
        { transform: `translateY(${-h}px)`, offset: 0.12 },
        { transform: `translateY(${-h}px)`, offset: 0.88 },
        { transform: 'translateY(0)' },
      ],
      { duration: 3300, delay: i * 18, easing: 'steps(30, end)', fill: 'backwards' },
    );

    // Vågen: varje figur hoppar strax efter grannen till vänster.
    for (let lap = 0; lap < 2; lap++) {
      person.animate(
        [
          { translate: '0 0' },
          { translate: `0 ${-h * 0.55}px`, offset: 0.45 },
          { translate: '0 0' },
        ],
        { duration: 380, delay: 500 + lap * 1100 + i * 45, easing: 'steps(6, end)' },
      );
    }

    // Applåder: små gnistor över huvudena när vågen har passerat.
    if (i % 2 === 0) {
      const clap = document.createElement('span');
      clap.className = 'fx-clap';
      clap.style.left = `${offset + i * step + 5 * scale - 10}px`;
      clap.style.top = `${innerHeight - h - 30}px`;
      layer.appendChild(clap);
      clap.animate(
        [
          { opacity: 0, transform: 'translateY(0) scale(0.6)' },
          { opacity: 1, transform: 'translateY(-10px) scale(1)', offset: 0.3 },
          { opacity: 1, transform: 'translateY(-16px) scale(1.2)', offset: 0.6 },
          { opacity: 0, transform: 'translateY(-26px) scale(0.8)' },
        ],
        { duration: 700, delay: 2300 + Math.random() * 500, easing: 'steps(8, end)', fill: 'both' },
      );
    }
  }
}

// Det medarbetarna faktiskt säger när de får prata om AI.
const QUOTES = [
  'Jag sparar en timme om dagen',
  'Får jag använda ChatGPT?',
  'Vi gör samma sak för hand varje vecka',
  'Jag vill lära mig mer',
  'Vem bestämmer om AI här?',
  'Kunderna skulle märka skillnad',
  'Jag är lite orolig, ärligt talat',
  'Ge mig en kväll så bygger jag det',
];

// Pratbubblor dyker upp runt om, skrivs ut bokstav för bokstav och svävar
// iväg. Så låter organisationen när någon frågar.
function chatter() {
  const layer = makeLayer(4400);
  const quotes = [...QUOTES].sort(() => Math.random() - 0.5).slice(0, innerWidth < 600 ? 5 : 7);
  const width = Math.min(240, innerWidth - 32);
  const bandTop = 90;
  const bandHeight = innerHeight - 220;

  quotes.forEach((text, i) => {
    const bubble = document.createElement('div');
    bubble.className = `fx-bubble${i % 2 ? ' right' : ''}`;
    bubble.style.maxWidth = `${width}px`;
    const lane = (i + 0.5) / quotes.length;
    const left = 16 + Math.random() * Math.max(0, innerWidth - width - 32);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${bandTop + lane * bandHeight}px`;
    layer.appendChild(bubble);

    const delay = i * 320;
    bubble.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.06 },
        { transform: 'scale(1) rotate(-2deg)', opacity: 1, offset: 0.1 },
        { transform: 'translateY(-10px) rotate(2deg)', opacity: 1, offset: 0.5 },
        { transform: 'translateY(-20px) rotate(-1deg)', opacity: 1, offset: 0.85 },
        { transform: 'translateY(-40px)', opacity: 0 },
      ],
      { duration: 3000, delay, easing: 'steps(30, end)', fill: 'both' },
    );

    let n = 0;
    setTimeout(function type() {
      bubble.textContent = text.slice(0, ++n);
      if (n < text.length) setTimeout(type, 28);
    }, delay + 150);
  });
}

const EFFECTS = [
  () => vision(document.querySelector('#headline .h1')),
  coins,
  breakthrough,
  crowd,
  chatter,
  freedom,
];

export function celebrate(index, from) {
  if (reducedMotion.matches) return;
  EFFECTS[index]?.(from);
}
