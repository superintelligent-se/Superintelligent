// Belöningarna i AI-resan, steg 3 och 5. De gör det spelet gör när man slår
// upp ett frågetecken: blocket studsar och pixelkonfetti sprutar. Sedan
// glider sidan ner till stegets avsnitt, där det ni får står i sin helhet.
// Det är vanliga länkar, så de fungerar också utan skript, med tangentbord
// och för den som bett om mindre rörelse.
import './rewards.css';
import { confetti } from './confetti.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

for (const step of document.querySelectorAll('.level .reward')) {
  const link = step.querySelector('.step-reward');
  const block = step.querySelector('.qb');
  const target = document.querySelector(link?.getAttribute('href'));
  if (!link || !block || !target || reducedMotion.matches) continue;

  link.addEventListener('click', (event) => {
    event.preventDefault();
    block.classList.remove('bump');
    void block.offsetWidth;
    block.classList.add('bump');
    confetti(block);
    // Konfettin hinner synas innan sidan glider vidare.
    setTimeout(() => {
      history.pushState(null, '', link.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 650);
  });
}
