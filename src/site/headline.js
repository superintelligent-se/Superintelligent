// Rubrikvalet överst på startsidan. Den första rubriken säger vad vi gör:
// lekfull AI-förändring som bygger på det medarbetarna redan gör. De fem
// andra visar samma sak från andra håll. Varje rubrik har ett eget
// frågetecken-block, en egen färg, en egen effekt och en egen pixelbild i
// spelets stil. Den stora knappen tar rubrikens färg och leder dit rubriken
// handlar om, medan Boka gratis möte är densamma hela tiden. Rubrik 1 står i
// HTML:en, så sökmotorer och den som inte klickar ser alltid den.
import './headline.css';
import { celebrate, vision } from './effects.js';
// Bilderna ritas av scripts/build-hero-art.mjs (npm run hero-art).
import art1 from './hero-art/scen-1.png';
import art2 from './hero-art/scen-2.png';
import art3 from './hero-art/scen-3.png';
import art4 from './hero-art/scen-4.png';
import art5 from './hero-art/scen-5.png';
import art6 from './hero-art/scen-6.png';

// Rubrikerna är korta och säger vad kunden vinner. Brödtexten under bär
// resonemanget, och siffrorna kommer från samma källor som resten av sidan.
const VARIANTS = [
  {
    eb: 'Rubrik 1 · Lekfullt',
    h1: 'Lekfull AI. Seriösa resultat.',
    sub: 'AI-förändring behöver inte vara tung och tråkig. Vi bygger på det era medarbetare redan gör och tycker om, så att nyfikenheten driver förändringen och resultaten kommer snabbt.',
    art: art1,
    alt: 'Ett kontor som en spelbana: medarbetare hoppar mellan skrivbord och plattformar och slår upp frågetecken som ger mynt.',
  },
  {
    eb: 'Rubrik 2 · Pengarna',
    // Samma tre nivåer som AI-skuldkalkylatorn. Hårda mellanslag så att
    // beloppet inte bryts isär.
    h1: '75–125\u00a0000\u00a0kr per medarbetare. Varje\u00a0år.',
    sub: 'Så mycket kostar det när AI inte används systematiskt i det dagliga arbetet, beroende på hur mycket av jobbet som är rutin. Räkna på er egen siffra.',
    art: art2,
    alt: 'Mynt sprutar ur frågetecken i en båge ner i en skattkista, bredvid ett stapeldiagram som stiger.',
  },
  {
    eb: 'Rubrik 3 · Möjligheterna',
    h1: 'Gör det som var omöjligt. Nu.',
    sub: 'Alla börjar med att effektivisera, och det betalar sig snabbt. Det stora värdet kommer när ni gör sådant ni tidigare saknade tid, kompetens eller resurser för. Vi kallar det Möjlighets-AI, och vår rådgivning hjälper er att hitta det.',
    art: art3,
    alt: 'En figur med jetpack lyfter från sitt skrivbord mot en flytande ö med en stjärna och en öppen, lysande dörr.',
  },
  {
    eb: 'Rubrik 4 · Människorna',
    h1: 'Alla medarbetare. AI-kompetenta. På\u00a0riktigt.',
    sub: 'Inte bara IT och några eldsjälar. Varje medarbetare lär sig använda AI i sitt eget jobb, från första frågan till en egen agent. Kunskapen stannar hos er.',
    art: art4,
    alt: 'En blandad grupp medarbetare hoppar uppför en trappa av plattformar mot en flagga, medan ledningen pekar ut riktningen nerifrån.',
  },
  {
    eb: 'Rubrik 5 · Intervjun',
    h1: 'Vad tänker er organisation om AI?',
    sub: 'Vår AI-intervjuare pratar med medarbetarna när det passar dem. Ledningen får en inblick i vad alla tänker, hoppas och oroar sig för som inget möte eller enkät kan ge.',
    art: art5,
    alt: 'Fyra medarbetare pratar med en AI-intervjuare i en mobil, och pratbubblor fyller luften runt dem.',
  },
  {
    eb: 'Rubrik 6 · Skillnaden',
    h1: 'Vi gör oss umbärliga. Med\u00a0flit.',
    sub: 'Vi har inget intresse av att ni ska behöva oss för alltid. Vår uppgift är att bygga er egen AI-förmåga, så att ni klarar er utan oss. Det är så vi förtjänar ert förtroende.',
    art: art6,
    alt: 'Laget springer uppför plattformarna mot flaggan med egen utrustning, medan vi vinkar från marken bredvid en kedja som brustit.',
  },
];

// Vart den stora knappen leder för varje rubrik. Färgen sätts i headline.css.
// Möjligheterna leder till rådgivningen och Människorna till Akademin, som
// sidan själv kopplar ihop dem: rådgivning gör språnget till Möjlighets-AI,
// träningen bygger förmågan hos medarbetarna. note är raden under knapparna
// och säger något om det knappen leder till.
const CTAS = [
  { href: '#ai-resan', text: 'Se er AI-resa ↓', note: 'Fem steg från första samtalet till egen AI-förmåga' },
  { href: 'ai-skuld/', text: 'Räkna på din AI-skuld →', note: 'Räknas i din webbläsare · Inget skickas till oss' },
  { href: '#radgivning', text: 'Ta språnget med rådgivning ↓', note: 'Tre nivåer · Första samtalet är alltid kostnadsfritt' },
  { href: 'https://akademi.superintelligent.se/collections', text: 'Utforska AI-akademin →', note: 'E-learning från 2 990 kr · Agent Masterclass på en halvdag' },
  { href: 'intervju/', text: 'Prova AI-intervjun →', note: 'Cirka 15 minuter · I mobilen eller datorn · Ingen app' },
  { href: 'om-oss/sa-tanker-vi/', text: 'Läs hur vi tänker →', note: 'Så mäter vi att ni klarar er utan oss' },
];

const root = document.getElementById('headline');
const eb = root?.querySelector('[data-part="eb"] [data-text]');
const h1 = root?.querySelector('[data-part="h1"]');
const sub = root?.querySelector('[data-part="sub"]');
const buttons = [...document.querySelectorAll('.picker .pick')];
const art = document.querySelector('#hero-art img');
const cta = document.getElementById('hero-cta');
const ctaLabel = cta?.querySelector('.cta-label');
const ctaNote = document.getElementById('hero-note');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let typing = 0;

// Hela rubrikblocket får höjden från den längsta varianten, så att knapparna
// under står still när rubriken byts. Rubriken och brödtexten ligger tätt
// ihop oavsett hur många rader rubriken tar, och det som blir över hamnar
// under brödtexten. Mäts om när bredden ändras.
function reserveHeight() {
  const keep = { h1: h1.textContent, sub: sub.innerHTML };
  let max = 0;
  root.style.minHeight = '';
  h1.style.minHeight = '';
  for (const v of VARIANTS) {
    h1.textContent = v.h1;
    sub.innerHTML = v.sub;
    max = Math.max(max, root.offsetHeight);
  }
  h1.textContent = keep.h1;
  sub.innerHTML = keep.sub;
  root.style.minHeight = `${max}px`;
}

// Medan rubriken skrivs ut håller den sin färdiga höjd, så att brödtexten
// inte hoppar nedåt rad för rad.
function holdHeight(text) {
  h1.style.minHeight = '';
  const keep = h1.textContent;
  h1.textContent = text;
  h1.style.minHeight = `${h1.offsetHeight}px`;
  h1.textContent = keep;
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
  const { href, text, note } = CTAS[index];
  const run = ++ctaRun;
  const parts = [[ctaLabel, text], [ctaNote, note]].filter(([el]) => el);
  cta.dataset.variant = String(index);
  cta.href = href;
  if (reducedMotion.matches) {
    for (const [el, value] of parts) el.textContent = value;
    return;
  }
  await Promise.all(parts.map(([el]) => el.animate(
    [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
    { duration: 160, easing: 'ease-in', fill: 'forwards' },
  ).finished.catch(() => {})));
  if (run !== ctaRun) return;
  for (const [el, value] of parts) {
    el.textContent = value;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220, easing: 'ease-out' },
    );
  }
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
  setCta(index);
  sub.classList.add('fade');
  sub.innerHTML = v.sub;
  holdHeight(v.h1);
  await typeOut(v.h1, run);
  if (run === typing) sub.classList.remove('fade');
}

// Rubrikerna byts av sig själva var femtonde sekund, så att man hinner läsa, så att startsidan
// också fungerar som öppningsbild i presentationer.
//
// Bytet stannar för gott när besökaren själv klickar ett block, och kan
// pausas med knappen bredvid förloppsstapeln. Det hoppas över när toppen
// av sidan inte syns eller fliken ligger i bakgrunden, och körs inte alls
// för den som bett om mindre rörelse.
const ROTATE_SECONDS = 15;
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
