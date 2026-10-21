// Pixelkonfetti i spelets färger. Används när man slår upp ett block: i
// AI-resans belöningar och i rubrikvalet överst på startsidan.

import './confetti.css';

const COLORS = ['#e0b23c', '#fde047', '#2e9e63', '#3fbf7f', '#7c3aed', '#c4b5fd', '#4f7fd6', '#f97316'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function confetti(from) {
  if (reducedMotion.matches) return;
  const box = from.getBoundingClientRect();
  const x0 = box.left + box.width / 2;
  const y0 = box.top + box.height / 2;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  for (let i = 0; i < 36; i++) {
    const bit = document.createElement('span');
    const size = [6, 8, 8, 10][i % 4];
    bit.style.cssText = `left:${x0}px;top:${y0}px;width:${size}px;height:${size}px;background:${COLORS[i % COLORS.length]}`;
    layer.appendChild(bit);

    // Uppåt och utåt, sedan faller den. Stegade kurvor ger 8-bitskänslan.
    const angle = (Math.PI * (i / 36)) + Math.PI + (Math.random() - 0.5) * 0.4;
    const power = 90 + Math.random() * 130;
    const dx = Math.cos(angle) * power * 1.3;
    const up = Math.sin(angle) * power;
    const fall = 160 + Math.random() * 140;
    bit.animate(
      [
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${up}px)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${up + fall}px)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 300, easing: 'steps(14, end)', fill: 'forwards' },
    );
  }
  setTimeout(() => layer.remove(), 1500);
}
