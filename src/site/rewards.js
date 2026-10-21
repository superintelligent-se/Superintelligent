// Belöningarna i AI-resan. Steg 3 och 5 har ingen sida att länka till, så de
// gör det spelet gör när man slår upp ett frågetecken: blocket studsar,
// pixelkonfetti sprutar och ett kort med det ni får reser sig ur marken.
// På desktop räcker det att peka, på mobil trycker man. Det är riktiga
// knappar, så det fungerar även med tangentbord och skärmläsare.
import './rewards.css';
import { confetti } from './confetti.js';

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

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
