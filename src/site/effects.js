// Effekterna i rubrikvalet. Varje rubrik har sin egen: konfetti för visionen,
// myntregn och kassaapparat för pengarna, stjärnsmäll för möjligheterna, en
// publik som gör vågen för människorna och pratbubblor för intervjun.
// Mynt och figurer ritas med spelets egna pixelritare, så det är samma värld.

import './effects.css';
import { confettiParty } from './confetti.js';
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

const STAR = ['...Y...', '...Y...', '..YWY..', 'YYWWWYY', '..YWY..', '...Y...', '...Y...'];
const STAR_COLORS = ['#fde047', '#c4b5fd', '#ffffff', '#3fbf7f', '#e0b23c'];
const starCanvases = [];

// En ljusblixt, en tryckvåg och stjärnor som flyger ut åt alla håll och
// gnistrar på vägen. Det omöjliga blir möjligt med en smäll.
function stars(from) {
  const { x, y } = center(from);
  const layer = makeLayer(2200);
  if (!starCanvases.length) {
    for (const c of STAR_COLORS) starCanvases.push(renderPixelCanvas(STAR, { Y: c, W: '#ffffff' }, 4));
  }

  const flash = document.createElement('div');
  flash.className = 'fx-flash';
  flash.style.setProperty('--x', `${x}px`);
  flash.style.setProperty('--y', `${y}px`);
  layer.appendChild(flash);
  flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }], { duration: 600, easing: 'steps(6, end)', fill: 'forwards' });

  for (let r = 0; r < 2; r++) {
    const ring = document.createElement('div');
    ring.className = 'fx-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    layer.appendChild(ring);
    ring.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(9)', opacity: 0 },
      ],
      { duration: 700, delay: r * 160, easing: 'steps(10, end)', fill: 'both' },
    );
  }

  const count = 28;
  for (let i = 0; i < count; i++) {
    const star = sprite(starCanvases[i % starCanvases.length], x - 14, y - 14, layer);
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const dist = 140 + Math.random() * Math.min(260, innerWidth / 2);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const spin = (Math.random() < 0.5 ? -1 : 1) * 360;
    star.animate(
      [
        { transform: 'translate(0, 0) scale(0.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1.4) rotate(${spin * 0.5}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx * 0.9}px, ${dy * 0.9}px) scale(0.6) rotate(${spin * 0.8}deg)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx}px, ${dy + 30}px) scale(1) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1200 + Math.random() * 500, delay: 60, easing: 'steps(16, end)', fill: 'backwards' },
    );
  }
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

const EFFECTS = [confettiParty, coins, stars, crowd, chatter];

export function celebrate(index, from) {
  if (reducedMotion.matches) return;
  EFFECTS[index]?.(from);
}
