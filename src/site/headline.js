// Rubrikvalet överst på startsidan. AI tog fram fem rubriker åt oss, och
// besökaren får slå upp blocken och se dem alla. Knapparna Spela spelet och
// Boka gratis möte är desamma oavsett rubrik. Rubrik 1 står i HTML:en, så
// sökmotorer och den som inte klickar ser alltid den.
import './headline.css';
import { confetti } from './confetti.js';

const VARIANTS = [
  {
    eb: 'Rubrik 1 · Visionen',
    h1: 'Bli ett superintelligent företag',
    sub: 'Från manuellt arbete och personberoende kunskap till en organisation som lär sig och blir bättre varje dag. Fem steg tar er dit, och det första tar fem minuter: spela spelet.',
  },
  {
    eb: 'Rubrik 2 · Pengarna',
    // Hårda mellanslag så att beloppet och "och år" inte bryts isär.
    h1: '100\u00a0000\u00a0kr per tjänsteman och\u00a0år',
    sub: 'Så mycket kostar det när AI inte används systematiskt i det dagliga arbetet, enligt vårt normala antagande. <a href="ai-skuld/">Räkna på er egen siffra</a>, eller börja med spelet.',
  },
  {
    eb: 'Rubrik 3 · Möjligheterna',
    h1: 'Spara tid först. Gör det omöjliga sedan.',
    sub: 'Alla börjar med att effektivisera, och det betalar sig snabbt. Det stora värdet kommer när ni gör sådant ni tidigare saknade tid, kompetens eller resurser för. Vi kallar det Möjlighets-AI.',
  },
  {
    eb: 'Rubrik 4 · Människorna',
    h1: 'AI-förmåga som stannar hos er',
    sub: 'Era medarbetare lär sig, era ledare väljer riktning och allt ni bygger är ert. Ingen plattform att hyra, inga konsulter som tar med sig kunskapen hem.',
  },
  {
    eb: 'Rubrik 5 · Farten',
    h1: 'De som ligger först drar ifrån',
    sub: 'De organisationer som ligger längst fram använder AI 8,3 gånger mer än en typisk organisation, och försprånget växer varje månad. Ni kommer ikapp ett steg i taget, och det första tar fem minuter.',
  },
];

const root = document.getElementById('headline');
const eb = root?.querySelector('[data-part="eb"] [data-text]');
const h1 = root?.querySelector('[data-part="h1"]');
const sub = root?.querySelector('[data-part="sub"]');
const buttons = [...document.querySelectorAll('.picker .pick')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let typing = 0;

// Höjden sätts efter den längsta varianten, så att knapparna under rubriken
// står still när den byts. Mäts om när bredden ändras.
function reserveHeight() {
  const keep = { h1: h1.textContent, sub: sub.innerHTML };
  let maxH1 = 0;
  let maxSub = 0;
  h1.style.minHeight = '';
  sub.style.minHeight = '';
  for (const v of VARIANTS) {
    h1.textContent = v.h1;
    sub.innerHTML = v.sub;
    maxH1 = Math.max(maxH1, h1.offsetHeight);
    maxSub = Math.max(maxSub, sub.offsetHeight);
  }
  h1.textContent = keep.h1;
  sub.innerHTML = keep.sub;
  h1.style.minHeight = `${maxH1}px`;
  sub.style.minHeight = `${maxSub}px`;
}

// Rubriken skrivs ut tecken för tecken, som text i ett 8-bitsspel.
function typeOut(text, run) {
  if (reducedMotion.matches) {
    h1.textContent = text;
    return Promise.resolve();
  }
  h1.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (run !== typing) return resolve();
      h1.textContent = text.slice(0, ++i);
      h1.appendChild(cursor);
      if (i < text.length) setTimeout(tick, 24);
      else {
        setTimeout(() => cursor.remove(), 500);
        resolve();
      }
    };
    tick();
  });
}

async function show(index, button) {
  const v = VARIANTS[index];
  const run = ++typing;
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));

  button.classList.remove('bump');
  void button.offsetWidth;
  button.classList.add('bump');
  confetti(button);

  eb.textContent = v.eb;
  sub.classList.add('fade');
  sub.innerHTML = v.sub;
  await typeOut(v.h1, run);
  if (run === typing) sub.classList.remove('fade');
}

if (root && buttons.length) {
  reserveHeight();
  let width = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === width) return;
    width = innerWidth;
    reserveHeight();
  });
  document.fonts?.ready.then(reserveHeight);
  buttons.forEach((button, i) => button.addEventListener('click', () => show(i, button)));
}
