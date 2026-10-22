// Rubrikvalet överst på startsidan. Vi tog fram sex rubriker med AI, och
// besökaren får slå upp blocken och se dem alla. Varje block har sin färg,
// och den stora knappen tar blockets färg och leder dit rubriken handlar om.
// Innan något valts är den lila och startar spelet. Boka gratis möte är
// densamma hela tiden. Rubrik 1 står i HTML:en, så sökmotorer och den som
// inte klickar ser alltid den.
import './headline.css';
import { celebrate, vision } from './effects.js';

// Rubrikerna är korta och säger vad kunden vinner. Brödtexten under bär
// resonemanget, och siffrorna kommer från samma källor som resten av sidan.
const VARIANTS = [
  {
    eb: 'Rubrik 1 · Visionen',
    h1: 'Hela organisationen. AI-driven.',
    sub: 'Från manuellt arbete och personberoende kunskap till en organisation som lär sig och blir bättre varje dag. Fem steg tar er dit, och det första tar fem minuter: spela spelet.',
  },
  {
    eb: 'Rubrik 2 · Pengarna',
    // Samma tre nivåer som AI-skuldkalkylatorn. Hårda mellanslag så att
    // beloppet inte bryts isär.
    h1: '75–125\u00a0000\u00a0kr per tjänsteman. Varje\u00a0år.',
    sub: 'Så mycket kostar det när AI inte används systematiskt i det dagliga arbetet, beroende på hur mycket av jobbet som är rutin. Räkna på er egen siffra.',
  },
  {
    eb: 'Rubrik 3 · Möjligheterna',
    h1: 'Gör det som var omöjligt. Nu.',
    sub: 'Alla börjar med att effektivisera, och det betalar sig snabbt. Det stora värdet kommer när ni gör sådant ni tidigare saknade tid, kompetens eller resurser för. Vi kallar det Möjlighets-AI, och vår rådgivning hjälper er att hitta det.',
  },
  {
    eb: 'Rubrik 4 · Människorna',
    h1: 'Alla medarbetare. AI-kompetenta. På\u00a0riktigt.',
    sub: 'Inte bara IT och några eldsjälar. Varje medarbetare lär sig använda AI i sitt eget jobb, från första frågan till en egen agent. Kunskapen stannar hos er.',
  },
  {
    eb: 'Rubrik 5 · Intervjun',
    h1: 'Vad tänker er organisation om AI?',
    sub: 'Vår AI-intervjuare pratar med medarbetarna när det passar dem. Ledningen får en inblick i vad alla tänker, hoppas och oroar sig för som inget möte eller enkät kan ge.',
  },
  {
    eb: 'Rubrik 6 · Skillnaden',
    h1: 'Vi gör oss umbärliga. Med\u00a0flit.',
    sub: 'Vi har inget intresse av att ni ska behöva oss för alltid. Vår uppgift är att bygga er egen AI-förmåga, så att ni klarar er utan oss. Det är så vi förtjänar ert förtroende.',
  },
];

// Vart den stora knappen leder för varje rubrik. Färgen sätts i headline.css.
// Möjligheterna leder till rådgivningen och Människorna till Akademin, som
// sidan själv kopplar ihop dem: rådgivning gör språnget till Möjlighets-AI,
// träningen bygger förmågan hos medarbetarna.
const CTAS = [
  { href: '#ai-resan', text: 'Se hela AI-resan ↓' },
  { href: 'ai-skuld/', text: 'Räkna på din AI-skuld →' },
  { href: '#radgivning', text: 'Ta språnget med rådgivning ↓' },
  { href: 'https://akademi.superintelligent.se/collections', text: 'Utforska AI-akademin →' },
  { href: 'intervju/', text: 'Prova AI-intervjun →' },
  { href: 'om-oss/sa-tanker-vi/', text: 'Läs hur vi tänker →' },
];

const root = document.getElementById('headline');
const eb = root?.querySelector('[data-part="eb"] [data-text]');
const h1 = root?.querySelector('[data-part="h1"]');
const sub = root?.querySelector('[data-part="sub"]');
const buttons = [...document.querySelectorAll('.picker .pick')];
const cta = document.getElementById('hero-cta');
const ctaLabel = cta?.querySelector('.cta-label');
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

// Knappen byter färg mjukt i CSS. Texten glider ut uppåt och den nya in
// underifrån, så att man ser att knappen hör till valet.
let ctaRun = 0;

async function setCta(index) {
  if (!cta || !ctaLabel) return;
  const { href, text } = CTAS[index];
  const run = ++ctaRun;
  cta.dataset.variant = String(index);
  cta.href = href;
  if (reducedMotion.matches) {
    ctaLabel.textContent = text;
    return;
  }
  await ctaLabel.animate(
    [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
    { duration: 160, easing: 'ease-in', fill: 'forwards' },
  ).finished.catch(() => {});
  if (run !== ctaRun) return;
  ctaLabel.textContent = text;
  ctaLabel.getAnimations().forEach((a) => a.cancel());
  ctaLabel.animate(
    [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 220, easing: 'ease-out' },
  );
}

async function show(index, button) {
  const v = VARIANTS[index];
  const run = ++typing;
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));

  button.classList.remove('bump');
  void button.offsetWidth;
  button.classList.add('bump');
  celebrate(index, button);

  eb.textContent = v.eb;
  setCta(index);
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

  // Välkomnar besökaren: visionens ljusfart spelas när sidan öppnas, om
  // rubriken syns och man inte kommit hit via en länk längre ner på sidan.
  if (!location.hash && scrollY < 200) vision(h1, { reveal: true });
}
