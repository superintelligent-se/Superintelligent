// Rubrikvalet överst på startsidan. Fem lekfulla rubriker som säger vad vi
// gör: AI-förändring som bygger på det medarbetarna redan gör och tycker om.
// Varje rubrik har ett eget frågetecken-block, en egen färg och en egen
// pixelbild i spelets stil. Knapparna under är desamma hela tiden: Se er
// AI-resa och Boka gratis möte. Rubrik 1 står i HTML:en, så sökmotorer och
// den som inte klickar ser alltid den.
import './headline.css';
import { celebrate, vision } from './effects.js';
// Bilderna ritas av scripts/build-hero-art.mjs (npm run hero-art).
import art1 from './hero-art/scen-1.png';
import art2 from './hero-art/scen-2.png';
import art3 from './hero-art/scen-3.png';
import art4 from './hero-art/scen-4.png';
import art5 from './hero-art/scen-5.png';

// Rubrikerna innehåller alla ordet lekfull. Brödtexten under bär
// resonemanget, och siffrorna kommer från samma källor som resten av sidan.
const VARIANTS = [
  {
    eb: 'Lekfullt',
    h1: 'Lekfull AI. Seriösa resultat.',
    sub: 'AI-förändring behöver inte vara tung och tråkig. Vi bygger på det era medarbetare redan gör och tycker om, så att nyfikenheten driver förändringen och resultaten kommer snabbt.',
    art: art1,
    alt: 'Ett kontor som en spelbana: medarbetare hoppar mellan skrivbord och plattformar och slår upp frågetecken som ger mynt.',
  },
  {
    eb: 'Snabbt',
    // Samma löfte som träningstrappan: e-learning och en halvdags masterclass.
    h1: 'Lekfull träning. En\u00a0egen agent på fyra\u00a0timmar.',
    sub: 'Medarbetarna lär sig genom att göra, i sina egna arbetsuppgifter. Efter e-learning och en halvdags masterclass har de en första egen agent på plats.',
    art: art2,
    alt: 'En medarbetare vid sin laptop bredvid ett timglas. Ur ett frågetecken har en liten robot hoppat ut och springer iväg med en hög dokument.',
  },
  {
    eb: 'Underifrån',
    h1: 'Lekfull förändring som växer underifrån.',
    sub: 'När alla får verktygen och modet att testa tar medarbetarna ägarskap, och idéerna kommer från dem som står närmast arbetet. Ledningen sätter riktningen, golvet driver farten.',
    art: art3,
    alt: 'En blandad grupp medarbetare hoppar uppför en trappa av plattformar mot en flagga, medan ledningen pekar ut riktningen nerifrån.',
  },
  {
    eb: 'Pengarna',
    // Samma nivåer som AI-skuldkalkylatorn. Hårda mellanslag så att
    // beloppet inte bryts isär.
    h1: 'Lekfullt på ytan. Pengar på sista\u00a0raden.',
    sub: 'Det lekfulla är vägen dit. Målet är tid och pengar: AI som inte används systematiskt kostar 75–125\u00a0000\u00a0kr per tjänsteman och år.',
    art: art4,
    alt: 'Mynt sprutar ur frågetecken i en båge ner i en skattkista, bredvid ett stapeldiagram som stiger.',
  },
  {
    eb: 'Möjligheterna',
    h1: 'Lekfull nyfikenhet. Möjligheter ni inte såg.',
    sub: 'Alla börjar med att spara tid. Det stora värdet kommer när nyfikenheten leder till sådant ni tidigare saknade tid, kompetens eller resurser för. Vi kallar det Möjlighets-AI.',
    art: art5,
    alt: 'En figur med jetpack lyfter från sitt skrivbord mot en flytande ö med en stjärna och en öppen, lysande dörr.',
  },
];

const root = document.getElementById('headline');
const eb = root?.querySelector('[data-part="eb"] [data-text]');
const h1 = root?.querySelector('[data-part="h1"]');
const sub = root?.querySelector('[data-part="sub"]');
const buttons = [...document.querySelectorAll('.picker .pick')];
const art = document.querySelector('#hero-art img');
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

// Bilden tonar över till nästa. Den nya laddas först, så att den inte
// blinkar fram halvritad.
let artRun = 0;

async function setArt(index) {
  if (!art) return;
  const { art: src, alt } = VARIANTS[index];
  const run = ++artRun;
  const next = new Image();
  next.src = src;
  await next.decode().catch(() => {});
  if (run !== artRun) return;
  if (reducedMotion.matches) {
    art.src = src;
    art.alt = alt;
    return;
  }
  await art.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
    .finished.catch(() => {});
  if (run !== artRun) return;
  art.src = src;
  art.alt = alt;
  art.getAnimations().forEach((a) => a.cancel());
  art.animate(
    [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 260, easing: 'ease-out' },
  );
}

let current = -1;

async function show(index, button) {
  const v = VARIANTS[index];
  const run = ++typing;
  current = index;
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));

  button.classList.remove('bump');
  void button.offsetWidth;
  button.classList.add('bump');
  celebrate(index, button);

  eb.textContent = v.eb;
  setArt(index);
  sub.classList.add('fade');
  sub.innerHTML = v.sub;
  await typeOut(v.h1, run);
  if (run === typing) sub.classList.remove('fade');
}

// Rubrikerna byts av sig själva var åttonde sekund, så att startsidan
// också fungerar som öppningsbild i presentationer.
//
// Bytet stannar för gott när besökaren själv klickar ett block, och kan
// pausas med knappen bredvid förloppsstapeln. Det hoppas över när toppen
// av sidan inte syns eller fliken ligger i bakgrunden, och körs inte alls
// för den som bett om mindre rörelse.
const ROTATE_SECONDS = 8;
const autoBox = document.getElementById('picker-auto');
const autoBtn = autoBox?.querySelector('.picker-auto-btn');
const autoFill = autoBox?.querySelector('.picker-auto-fill');

let autoOn = false;
let heroVisible = true;
let elapsed = 0;

function setProgress(fraction) {
  if (!autoFill) return;
  autoFill.style.transform = `scaleX(${autoOn ? Math.min(1, Math.max(0, fraction)) : 0})`;
  autoFill.dataset.variant = String(upNext());
}

// Rubrik 1 står på sidan från början, så första bytet går till rubrik 2.
function upNext() {
  return (Math.max(current, 0) + 1) % buttons.length;
}

function setAuto(on) {
  autoOn = on;
  elapsed = 0;
  autoBtn?.setAttribute('aria-pressed', String(!on));
  autoBtn?.setAttribute('aria-label', on ? 'Pausa bytet av rubriker' : 'Starta bytet av rubriker');
  setProgress(0);
}

function stopAuto() {
  setAuto(false);
}

function startAuto() {
  if (!autoBox || reducedMotion.matches) return;
  autoBox.hidden = false;
  setAuto(true);
  autoBtn.addEventListener('click', () => setAuto(!autoOn));

  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
  }).observe(root);

  // Klockan står still medan toppen inte syns, så man aldrig missar ett byte.
  const STEP = 0.2;
  setInterval(() => {
    if (!autoOn || document.hidden || !heroVisible) return;
    elapsed += STEP;
    if (elapsed >= ROTATE_SECONDS) {
      elapsed = 0;
      const i = upNext();
      show(i, buttons[i]);
    }
    setProgress(elapsed / ROTATE_SECONDS);
  }, STEP * 1000);
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
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    stopAuto();
    show(i, button);
  }));

  // Välkomnar besökaren: visionens ljusfart spelas när sidan öppnas, om
  // rubriken syns och man inte kommit hit via en länk längre ner på sidan.
  if (!location.hash && scrollY < 200) vision(h1, { reveal: true });

  startAuto();
}
