// Belöningarna i AI-resan. Steg 3 och 5 har ingen sida att länka till, så de
// gör det spelet gör när man slår upp ett frågetecken: blocket studsar,
// pixelkonfetti sprutar och ett kort med det ni får reser sig ur marken.
// På desktop räcker det att peka, på mobil trycker man. Det är riktiga
// knappar, så det fungerar även med tangentbord och skärmläsare.
import './rewards.css';

const COLORS = ['#e0b23c', '#fde047', '#2e9e63', '#3fbf7f', '#7c3aed', '#c4b5fd', '#4f7fd6', '#f97316'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

function confetti(from) {
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

for (const step of document.querySelectorAll('.level .reward')) {
  const button = step.querySelector('.step-reward');
  const card = step.querySelector('.reward-card');
  const block = step.querySelector('.qb');
  let pinned = false;
  let lastBurst = 0;
  let closeTimer;

  const open = () => {
    clearTimeout(closeTimer);
    if (!card.hidden) return;
    card.hidden = false;
    step.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    block.classList.remove('bump');
    void block.offsetWidth;
    block.classList.add('bump');
    if (Date.now() - lastBurst > 1200) {
      lastBurst = Date.now();
      confetti(block);
    }
  };

  const close = () => {
    card.hidden = true;
    pinned = false;
    step.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', () => {
    if (card.hidden) {
      pinned = true;
      open();
    } else if (pinned || !canHover.matches) {
      close();
    } else {
      pinned = true;
    }
  });

  step.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && canHover.matches) open();
  });
  step.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse' || pinned) return;
    closeTimer = setTimeout(close, 350);
  });
  step.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !card.hidden) {
      close();
      button.focus();
    }
  });
}
