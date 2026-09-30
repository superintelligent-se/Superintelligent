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
