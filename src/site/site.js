// Delat för sajtens sidor (inte spelet): typsnitt, meny och bokningslänkar.
// Typsnitten ligger lokalt så att inga besökardata går till Google Fonts.
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-500.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import '@fontsource/hanken-grotesk/latin-700.css';
import '@fontsource/hanken-grotesk/latin-800.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/silkscreen/latin-400.css';
import './site.css';
import { BOOKING_URL } from '../config.js';

// Bokningsadressen står på ett ställe, samma som spelet och mejlet använder.
for (const link of document.querySelectorAll('[data-booking]')) {
  link.href = BOOKING_URL;
  link.target = '_blank';
  link.rel = 'noopener';
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');

if (toggle && nav) {
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

// Menyn följer avsnittet man läser. Länkar som pekar på ett avsnitt på samma
// sida får klassen is-current när avsnittet passerar mitten av skärmen. På
// mobil, där menyn är fälld, visas samma sak som en remsa under sidhuvudet.
// Andra sidor har menylänkar till startsidan och markerar sig med
// aria-current i stället.
const NOW = {
  'ai-resan': 'Er AI-resa · Fem steg',
  spelet: 'Steg 1 · Spelet',
  intervju: 'Steg 2 · AI-intervjun',
  radgivning: 'Steg 4A · Rådgivning',
  traning: 'Steg 4B · Träning',
  slutspelet: 'Steg 5 · Slutspelet',
};

const spyLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
const spied = spyLinks
  .map((link) => [link, document.getElementById(link.getAttribute('href').slice(1))])
  .filter(([, section]) => section);

if (spied.length) {
  const topbar = document.querySelector('.topbar');
  const now = document.createElement('div');
  now.className = 'nav-now';
  now.hidden = true;
  now.setAttribute('aria-hidden', 'true');
  now.innerHTML = '<i></i><span></span>';
  topbar?.appendChild(now);

  const setCurrent = (id) => {
    let shown = false;
    for (const [link, section] of spied) {
      const on = section.id === id;
      link.classList.toggle('is-current', on);
      if (on && NOW[id]) {
        now.style.setProperty('--c', getComputedStyle(link).getPropertyValue('--c'));
        now.querySelector('span').textContent = NOW[id];
        shown = true;
      }
    }
    now.hidden = !shown;
  };

  // Mittlinjen avgör: det avsnitt som korsar skärmens mitt är det man läser.
  // Avsnitt utan menylänk, som kunderna och Varför nu, släcker markeringen.
  const sections = [...document.querySelectorAll('main > section')];
  let currentId;
  const update = () => {
    const middle = innerHeight / 2;
    const hit = sections.find((section) => {
      const box = section.getBoundingClientRect();
      return box.top <= middle && box.bottom > middle;
    });
    const id = hit?.id;
    if (id === currentId) return;
    currentId = id;
    setCurrent(id);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
