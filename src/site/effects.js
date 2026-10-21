// Effekterna i rubrikvalet. Varje rubrik har sin egen: ljusfart för visionen,
// myntregn och kassaapparat för pengarna, stjärnsmäll för möjligheterna, en
// publik som gör vågen för människorna och pratbubblor för intervjun.
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

const STAR = ['...Y...', '...Y...', '..YWY..', 'YYWWWYY', '..YWY..', '...Y...', '...Y...'];
const STAR_COLORS = ['#fde047', '#c4b5fd', '#ffffff', '#3fbf7f', '#e0b23c'];
const starCanvases = [];

// Ett ljussken runt blocket, två tryckvågor och stjärnor som flyger ut åt
// alla håll och gnistrar på vägen. Det omöjliga blir möjligt med en smäll.
function stars(from) {
  const { x, y } = center(from);
  if (!starCanvases.length) {
    for (const c of STAR_COLORS) starCanvases.push(renderPixelCanvas(STAR, { Y: c, W: '#ffffff' }, 4));
  }
  const reach = Math.min(260, innerWidth / 2);
  const flying = Array.from({ length: 28 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.3;
    const dist = 140 + Math.random() * reach;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, life: 1100 + Math.random() * 500, img: starCanvases[i % starCanvases.length] };
  });

  canvasLayer((ctx, t) => {
    // Skenet: en ring av ljus kring blocket, aldrig över hela sidan.
    if (t < 450) {
      const a = 1 - t / 450;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 140);
      glow.addColorStop(0, `rgba(255, 255, 255, ${0.85 * a})`);
      glow.addColorStop(0.4, `rgba(253, 224, 71, ${0.4 * a})`);
      glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 140, y - 140, 280, 280);
    }

    for (const delay of [0, 160]) {
      const p = (t - delay) / 700;
      if (p < 0 || p > 1) continue;
      const r = snap(20 + p * 170);
      ctx.strokeStyle = `rgba(253, 224, 71, ${1 - p})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    }

    let alive = t < 900;
    for (const s of flying) {
      const p = Math.min(1, t / s.life);
      if (p >= 1) continue;
      alive = true;
      const ease = 1 - (1 - p) ** 3;
      const scale = p < 0.4 ? 0.3 + p * 2.7 : 1.4 - (p - 0.4) * 1.2;
      const size = snap(28 * scale) || 4;
      ctx.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
      ctx.drawImage(s.img, snap(x + s.dx * ease - size / 2), snap(y + s.dy * ease + p * p * 30 - size / 2), size, size);
    }
    ctx.globalAlpha = 1;
    return alive;
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
  stars,
  crowd,
  chatter,
];

export function celebrate(index, from) {
  if (reducedMotion.matches) return;
  EFFECTS[index]?.(from);
}
