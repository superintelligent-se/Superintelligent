// Pixelkonfetti i spelets färger. Används när man slår upp ett block: i
// AI-resans belöningar och i rubrikvalet överst på startsidan.

import './confetti.css';

const COLORS = ['#e0b23c', '#fde047', '#2e9e63', '#3fbf7f', '#7c3aed', '#c4b5fd', '#4f7fd6', '#f97316'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function makeLayer(ms) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), ms);
  return layer;
}

// En bit papper: kvadrat eller remsa, som snurrar och fladdrar när den faller.
function piece(layer, x, y, i) {
  const bit = document.createElement('span');
  const strip = i % 3 === 0;
  const w = strip ? 4 : [6, 8, 10][i % 3];
  const h = strip ? 12 : w;
  bit.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${COLORS[i % COLORS.length]}`;
  layer.appendChild(bit);
  return bit;
}

// Uppåt och utåt från blocket, sedan faller den. Stegade kurvor ger 8-bitskänslan.
function burst(layer, x0, y0, count) {
  for (let i = 0; i < count; i++) {
    const bit = piece(layer, x0, y0, i);
    const angle = Math.PI * (i / count) + Math.PI + (Math.random() - 0.5) * 0.4;
    const power = 90 + Math.random() * 150;
    const dx = Math.cos(angle) * power * 1.3;
    const up = Math.sin(angle) * power;
    const fall = 180 + Math.random() * 160;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540);
    const sway = 12 + Math.random() * 16;
    bit.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${up}px) rotate(${spin * 0.4}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx * 0.8 + sway}px, ${up + fall * 0.4}px) rotate(${spin * 0.7}deg)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx - sway}px, ${up + fall}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 400, easing: 'steps(18, end)', fill: 'forwards' },
    );
  }
}

export function confetti(from) {
  if (reducedMotion.matches) return;
  const box = from.getBoundingClientRect();
  burst(makeLayer(1700), box.left + box.width / 2, box.top + box.height / 2, 40);
}

// Hela festen: först en salva från blocket, sedan regnar det konfetti över
// hela skärmen och den fladdrar från sida till sida på vägen ner.
export function confettiParty(from) {
  if (reducedMotion.matches) return;
  const box = from.getBoundingClientRect();
  const layer = makeLayer(3400);
  burst(layer, box.left + box.width / 2, box.top + box.height / 2, 48);

  const count = Math.min(90, Math.round(innerWidth / 8));
  for (let i = 0; i < count; i++) {
    const bit = piece(layer, Math.random() * innerWidth, -16, i + 1);
    const fall = innerHeight + 40;
    const sway = 20 + Math.random() * 30;
    const spin = 360 + Math.random() * 720;
    bit.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${sway}px, ${fall * 0.25}px) rotate(${spin * 0.25}deg)` },
        { transform: `translate(${-sway}px, ${fall * 0.5}px) rotate(${spin * 0.5}deg)` },
        { transform: `translate(${sway}px, ${fall * 0.75}px) rotate(${spin * 0.75}deg)` },
        { transform: `translate(0, ${fall}px) rotate(${spin}deg)` },
      ],
      { duration: 1800 + Math.random() * 900, delay: 250 + Math.random() * 500, easing: 'steps(30, end)', fill: 'backwards' },
    );
  }
}
