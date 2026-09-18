import { isMuted, setMuted, sfx } from './audio.js';
import { renderAvatarCanvas } from './avatars.js';
import { renderCoinCanvas, renderGearCanvas } from './pixelart.js';
import { initTouchControls, isTouchDevice } from './touch.js';
import { COINS_PER_DIMENSION, DIMENSIONS, QUESTIONS, ROLES } from './data/gameData.js';
import { answeredCount, coinsEarned, state } from './state.js';
import { leadPayload } from './summary.js';

// URL:en till flödet som tar emot leadet. Tom sträng = testläge: inget skickas,
// allt loggas i webbläsarkonsolen. Hela uppsättningen — Microsoft List,
// Power Automate-flödet och mejlet till spelaren — står i
// docs/lead-till-microsoft.md.
const FORM_ENDPOINT = '';

// Endpointen ligger i den byggda JS-filen och är därmed offentlig. Nyckeln
// hindrar ingen som läser koden, men sorterar bort bottar som skjuter blint
// mot allt de hittar. Flödet kastar allt som inte bär rätt nyckel.
const FORM_KEY = 'superintelligent-game';

// Vart prospektet skickas efter att svaren lämnats. Mötet är huvudvägen,
// träningen ett mindre alternativ för den som hellre börjar själv.
const BOOKING_URL = 'https://superintelligent.se/boka';
const TRAINING_URL = 'https://superintelligent.se/traning';

// Sista utvägen om inskicket inte går fram. Ett lead som mejlas in är
// fortfarande ett lead.
const CONTACT_EMAIL = 'support@superintelligent.se';

const el = (id) => document.getElementById(id);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setGameInput(enabled) {
  window.dispatchEvent(new CustomEvent('game-input', { detail: { enabled } }));
}

// Phaser fångar W, A, D och mellanslag globalt på window med preventDefault.
// Ligger fokus i ett textfält måste tangenterna nå fältet i stället, annars
// går det inte att skriva "Wallin" eller "Anna" i formuläret.
document.addEventListener('focusin', (event) => {
  if (event.target.matches('input, textarea')) setGameInput(false);
});
document.addEventListener('focusout', (event) => {
  if (event.target.matches('input, textarea')) setGameInput(true);
});

// En och samma tangentbordsnavigering för varje lista i spelet: startsidan,
// instruktionerna, frågorna och röret. Upp/ner väljer, höger eller Enter
// bekräftar, Escape backar ett steg.
function attachListNavigation(buttons, { onPick, onCancel = null }) {
  let selected = 0;

  const select = (index) => {
    selected = index;
    buttons.forEach((button, i) => button.classList.toggle('selected', i === index));
  };

  const detach = () => document.removeEventListener('keydown', onKeyDown);

  function onKeyDown(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      select((selected + step + buttons.length) % buttons.length);
    } else if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      detach();
      onPick(selected);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      // Utan detta bubblar samma tryck vidare till spelets Escape-lyssnare,
      // som då öppnar omstartsfrågan i samma ögonblick som den här stängs.
      event.stopPropagation();
      if (!onCancel) return;
      detach();
      onCancel();
    }
  }

  buttons.forEach((button, index) => button.addEventListener('mouseenter', () => select(index)));
  select(0);
  document.addEventListener('keydown', onKeyDown);
  return { detach };
}

// Vrid-uppmaningen ska möta besökaren direkt, före startskärmen.
initRotateHint();

export function showRoleSelect(onPick) {
  const container = el('role-buttons');
  container.innerHTML = '';

  const buttons = ROLES.map((role) => {
    const button = document.createElement('button');
    button.className = 'choice role';
    button.type = 'button';

    button.appendChild(renderAvatarCanvas(role.id, 4));

    const text = document.createElement('span');
    text.innerHTML =
      `${role.label}<span class="role-blurb">${role.blurb}</span>` +
      `<span class="role-prop">${role.prop}</span>`;
    button.appendChild(text);
    container.appendChild(button);
    return button;
  });

  const choose = (index) => {
    nav.detach();
    state.role = ROLES[index];
    el('overlay-role').hidden = true;
    showHowTo(onPick, () => showRoleSelect(onPick));
  };

  buttons.forEach((button, index) => button.addEventListener('click', () => choose(index)));
  const nav = attachListNavigation(buttons, { onPick: choose });
  el('overlay-role').hidden = false;
}

// Röret är ett erbjudande med glimten i ögat: hoppa över allt arbete, precis
// som man gör när man tar in hjälp utifrån.
export function showShortcutPrompt(onChoice) {
  const tag = el('question-dimension');
  tag.textContent = 'Genvägen';
  tag.style.color = '#2fbf57';
  el('question-text').textContent = 'Vill du fuska till slutet av banan?';

  const note = el('shortcut-note');
  note.innerHTML = `
    Du landar bakom flaggstången, raketen står och väntar och ingen ser något.
    Ungefär som att ta in oss: rådgivning uppifrån och AI-träning underifrån,
    samtidigt, i stället för att famla er fram i två år.
    <br /><br />
    Men du missar överraskningarna på vägen — och framför allt eftertanken.
    Av erfarenhet är det just frågorna som får saker att lossna.
    <br /><br />
    Väljer du röret säger du samtidigt: <em>vi vet redan att vi behöver hjälp,
    och tiden läggs hellre på hur snabbt vi kommer igång.</em> Frågorna finns
    kvar — vi tar dem när vi ses.`;
  note.hidden = false;
  el('question-hint').hidden = false;

  renderChoices({
    items: [
      'Ja. Vi vet redan att vi behöver hjälp — låt oss prata i stället.',
      'Nej, jag spelar klart banan själv.',
    ],
    onPick: (index) => {
      note.hidden = true;
      onChoice(index === 0);
    },
    onCancel: () => {
      note.hidden = true;
      onChoice(false);
    },
  });
}

// Samma lista, samma tangenter, oavsett om det är en fråga eller röret.
// Översta alternativet är alltid förvalt: vill du längre ner i listan — mot
// högre mognad — ska det vara ett aktivt val, inte något man råkar trycka på.
function renderChoices({ items, onPick, onCancel = null, markedIndex = null }) {
  const options = el('question-options');
  options.innerHTML = '';

  let selected = 0;
  const buttons = items.map((label, index) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    const marked = index === markedIndex ? '<span class="choice-previous">ditt svar</span>' : '';
    button.innerHTML = `<span class="choice-marker">▸</span><span>${label}</span>${marked}`;
    button.addEventListener('mouseenter', () => select(index));
    button.addEventListener('click', () => pick(index));
    options.appendChild(button);
    return button;
  });

  function select(index) {
    selected = index;
    buttons.forEach((button, i) => button.classList.toggle('selected', i === index));
  }

  function close() {
    document.removeEventListener('keydown', onKeyDown);
    el('overlay-question').removeEventListener('mousedown', onBackdrop);
    el('overlay-question').hidden = true;
  }

  function pick(index) {
    close();
    onPick(index);
  }

  // Escape och klick vid sidan stänger alltid. Varje anrop skickar med en
  // onCancel som återupptar spelet — utan den skulle figuren bli stående.
  function cancel() {
    close();
    if (onCancel) onCancel();
  }

  // Klick vid sidan om panelen räknas som att backa ut.
  function onBackdrop(event) {
    if (event.target === el('overlay-question')) cancel();
  }

  function onKeyDown(event) {
    // Upp och ner väljer, höger och Enter svarar — höger eftersom tummen
    // redan ligger på pilarna när man springer.
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      select((selected + step + buttons.length) % buttons.length);
    } else if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(selected);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      // Utan detta bubblar samma tryck vidare till spelets Escape-lyssnare,
      // som då öppnar omstartsfrågan i samma ögonblick som den här stängs.
      event.stopPropagation();
      cancel();
    }
  }

  select(0);
  document.addEventListener('keydown', onKeyDown);
  el('overlay-question').addEventListener('mousedown', onBackdrop);
  el('overlay-question').hidden = false;
}



// Escape backar ur en fråga. Trycker du Escape mitt i spelet frågar vi i
// stället om allt ska börjas om — med svaren du gett som insats.
export function showRestartPrompt(onChoice) {
  const tag = el('question-dimension');
  tag.textContent = 'Paus';
  tag.style.color = '#fde047';
  el('question-text').textContent = 'Börja om från början?';

  const note = el('shortcut-note');
  note.textContent =
    'Alla svar du har gett hittills försvinner och du börjar på ruta ett igen.';
  note.hidden = false;
  el('question-hint').hidden = false;

  const done = (restart) => {
    note.hidden = true;
    onChoice(restart);
  };

  renderChoices({
    items: ['Nej, fortsätt spela', 'Ja, börja om — radera mina svar'],
    onPick: (index) => done(index === 1),
    onCancel: () => done(false),
  });
}

export function isDialogOpen() {
  return !el('overlay-question').hidden;
}

// Webbläsaren visar sin egen varningstext här — den går inte att styra —
// men frågan kommer upp, och det är poängen: svaren finns bara i minnet.
window.addEventListener('beforeunload', (event) => {
  if (answeredCount() > 0 && !endShown) {
    event.preventDefault();
    event.returnValue = '';
  }
});

function showHowTo(onDone, onBack) {
  const overlay = el('overlay-howto');
  if (isTouchDevice()) applyTouchInstructions();
  overlay.hidden = false;

  const start = el('howto-start');
  const clone = start.cloneNode(true);
  start.replaceWith(clone);

  const begin = () => {
    nav.detach();
    overlay.hidden = true;
    el('hud').hidden = false;
    el('sound-toggle').hidden = false;
    // Först nu blir liggande läge värt att be om — avatarval och
    // instruktioner läser sig bättre stående.
    document.body.classList.add('playing');
    sfx.zone();
    onDone();
  };

  clone.addEventListener('click', begin);
  const nav = attachListNavigation([clone], {
    onPick: begin,
    onCancel: () => {
      overlay.hidden = true;
      onBack();
    },
  });
}


// På telefon säger tangentbordsraderna ingenting. Byt ut dem mot knapparna
// spelaren faktiskt har framför sig.
function applyTouchInstructions() {
  const rows = document.querySelectorAll('#overlay-howto .howto-row');
  const replacements = [
    ['◀ ▶', 'Spring åt vänster och höger'],
    ['▲', 'Hoppa'],
    ['▲ ▲', 'Tryck igen i luften för ett extra hopp — så når du de höga avsatserna'],
  ];

  rows.forEach((row, index) => {
    const replacement = replacements[index];
    if (!replacement) {
      row.hidden = true;
      return;
    }
    row.querySelector('.keys').innerHTML = replacement[0]
      .split(' ')
      .map((glyph) => `<kbd>${glyph}</kbd>`)
      .join('');
    row.querySelector('.howto-text').textContent = replacement[1];
  });

  el('howto-start').textContent = 'Kör!';
}

// Spelytan är 16:9. I stående läge blir den liten men fullt spelbar, så vi
// uppmanar till att vrida i stället för att blockera — rotationslås är
// vanligt, och då vore en låst skärm värre än en liten spelyta.
// Uppmaningen kommer först när banan börjar: avatarval och instruktioner
// läser sig bättre stående. Vem som ser den avgörs i CSS.
function initRotateHint() {
  el('rotate-dismiss').addEventListener('click', () => {
    document.body.classList.add('rotate-dismissed');
  });
}

// HUD:en och ljudknappen ritas i px men hör till spelbilden. Skalan här
// håller dem i samma proportion som canvasen, oavsett skärm.
function syncStageScale() {
  const stage = el('stage');
  stage.style.setProperty('--stage-scale', stage.clientWidth / 960);
}

export function initMobile() {
  initTouchControls();
  syncStageScale();
  window.addEventListener('resize', syncStageScale);
  window.addEventListener('orientationchange', () => setTimeout(syncStageScale, 200));
}

export function initSoundToggle() {
  const button = el('sound-toggle');
  const render = () => {
    button.textContent = isMuted() ? 'LJUD AV' : 'LJUD PÅ';
    button.classList.toggle('muted', isMuted());
  };

  button.addEventListener('click', () => {
    setMuted(!isMuted());
    render();
    if (!isMuted()) sfx.coin();
  });
  render();
}

export function buildHud() {
  const bars = el('hud-bars');
  bars.innerHTML = '';

  // Ingen gruppering: ordningen på banan är ordningen i HUD:en, och varje
  // dimension bär sin egen färg i stället.
  for (const dimension of DIMENSIONS) {
    const row = document.createElement('div');
    row.className = 'hud-row';

    const label = document.createElement('span');
    label.className = 'hud-label';
    label.textContent = dimension.label;
    label.style.color = dimension.color;

    const track = document.createElement('span');
    track.className = 'hud-track';
    for (let i = 0; i < COINS_PER_DIMENSION; i += 1) {
      const slot = document.createElement('span');
      slot.className = 'coin-slot';
      slot.id = `coin-${dimension.id}-${i}`;
      slot.appendChild(renderCoinCanvas(dimension.color, 2));
      track.appendChild(slot);
    }

    const gear = document.createElement('span');
    gear.className = 'hud-gear';
    gear.id = `gear-${dimension.id}`;
    gear.style.setProperty('--dim', dimension.color);
    gear.appendChild(renderGearCanvas(GEAR_ICONS[dimension.gear], 2, dimension.color));

    row.append(label, track, gear);
    bars.appendChild(row);
  }
  updateHud();
}

const GEAR_ICONS = {
  shield: 'shield',
  datacube: 'datacube',
  trail: 'thrust',
  companion: 'companion',
  jetpack: 'jetpack',
};

// Utrustningen syns bredvid dimensionen som gav den.
export function markGear(dimensionId, on) {
  const badge = el(`gear-${dimensionId}`);
  if (!badge) return;
  badge.classList.toggle('active', on);
  if (on) {
    badge.classList.add('pop');
    setTimeout(() => badge.classList.remove('pop'), 700);
  }
}

export function updateHud() {
  for (const dimension of DIMENSIONS) {
    const earned = coinsEarned(dimension.id);
    for (let i = 0; i < COINS_PER_DIMENSION; i += 1) {
      el(`coin-${dimension.id}-${i}`).classList.toggle('earned', i < earned);
    }
  }
  el('hud-progress').textContent =
    `${answeredCount()} / ${QUESTIONS.length} frågetecken`;
}

// Myntet flyger från blocket i spelvärlden till sin plats i HUD:en.
export function flyCoinToHud(dimensionId, coinIndex, canvas, from) {
  const slot = el(`coin-${dimensionId}-${coinIndex}`);
  if (!slot) return;

  const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
  const rect = canvas.getBoundingClientRect();
  const startX = rect.left + (from.x / from.gameWidth) * rect.width;
  const startY = rect.top + (from.y / from.gameHeight) * rect.height;
  const target = slot.getBoundingClientRect();

  const flier = document.createElement('div');
  flier.className = 'coin-flier';
  flier.appendChild(renderCoinCanvas(dimension.color, 3));
  flier.style.left = `${startX}px`;
  flier.style.top = `${startY}px`;
  document.body.appendChild(flier);

  requestAnimationFrame(() => {
    flier.style.transform =
      `translate(${target.left - startX + 6}px, ${target.top - startY + 6}px) scale(0.6)`;
    flier.style.opacity = '0.2';
  });

  setTimeout(() => {
    flier.remove();
    slot.classList.add('landed');
    setTimeout(() => slot.classList.remove('landed'), 400);
  }, 620);
}

export function showQuestion(question, previousIndex, onAnswer, onCancel) {
  const dimension = DIMENSIONS.find((d) => d.id === question.dimension);
  const tag = el('question-dimension');
  tag.textContent = previousIndex === null ? dimension.label : `${dimension.label} · ändra svar`;
  tag.style.color = dimension.color;
  el('question-text').textContent = question.text;
  el('shortcut-note').hidden = true;
  el('question-hint').hidden = false;

  renderChoices({
    items: question.options.map((option) => option.label),
    markedIndex: previousIndex,
    onPick: (index) => onAnswer(index),
    onCancel,
  });
}


let endShown = false;

export function showEnd(bonus) {
  // Slutskärmen är där leadet fångas — den får aldrig visas två gånger,
  // och aldrig utebli för att en animation frös när någon bytte flik.
  if (endShown) return;
  endShown = true;

  if (bonus) {
    // Hoppbonusen är skoj och stannar på skärmen — den följer aldrig med
    // i leadet, eftersom den inte säger något om AI-mognad.
    el('end-bonus').textContent = state.shortcut
      ? `Hoppbonus +${bonus} — fusk ger inte så mycket poäng, men desto mer tid`
      : `Hoppbonus +${bonus}`;
    el('end-bonus').hidden = false;
  }

  if (state.shortcut) {
    // Den som tog röret har inga svar att analysera. Då finns heller ingen
    // sammanfattning att mejla. Säg det rakt ut i stället för att lova en
    // profil som inte finns.
    el('overlay-end').querySelector('h1').textContent = 'Du tog röret!';
    el('end-intro').textContent =
      'Inga svar den här gången — du hoppade rakt till slutet. Det säger egentligen allt vi behöver veta för ett första samtal: ni vill komma igång, inte kartlägga. Lämna dina uppgifter så tar vi frågorna när vi ses.';
    el('end-note').textContent =
      'Någon sammanfattning per mejl blir det alltså inte — det finns inga svar att sammanfatta. Du får en bekräftelse, resten tar vi i samtalet.';
    el('lead-form').querySelector('.consent span').textContent =
      'Ja, kontakta mig om ett första samtal. Vi sparar dina uppgifter för det ändamålet och delar dem inte med någon annan.';
    el('lead-submit').textContent = 'Skicka och boka samtal';
  }

  el('overlay-end').hidden = false;
  // Spelet ska sluta äta W, A, D och mellanslag så fälten går att fylla i.
  setGameInput(false);
  el('book-link').href = BOOKING_URL;
  el('training-link').href = TRAINING_URL;

  el('lead-form').addEventListener('submit', onLeadSubmit);
}

async function onLeadSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = el('lead-status');
  const submit = el('lead-submit');
  const fields = Object.fromEntries(new FormData(form).entries());

  // Honungsfällan är dold för människor men fylls i av formulärbottar.
  // Är den ifylld låtsas vi att allt gick bra och skickar ingenting.
  if (fields.webbplats) {
    showNextSteps(form);
    return;
  }

  const payload = {
    ...leadPayload({
      namn: fields.namn,
      foretag: fields.foretag,
      epost: fields.epost,
      mobil: fields.mobil || '',
    }),
    nyckel: FORM_KEY,
    samtycke: Boolean(fields.samtycke),
  };

  if (!FORM_ENDPOINT) {
    console.info('Lead payload (ingen endpoint konfigurerad ännu):', payload);
    status.textContent = 'Tack! (Testläge — leadet loggades i webbläsarkonsolen.)';
    status.hidden = false;
    showNextSteps(form);
    return;
  }

  const label = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'Skickar …';
  status.textContent = '';
  status.hidden = true;

  try {
    await postLead(payload);
    status.textContent = state.shortcut
      ? 'Tack! Vi hör av oss — en bekräftelse ligger i din inkorg.'
      : 'Tack! Sammanfattningen är på väg till din inkorg. Kolla skräpposten om den dröjer.';
    status.hidden = false;
    showNextSteps(form);
  } catch (error) {
    console.warn('Leadet gick inte att skicka:', error);
    status.innerHTML =
      'Något gick fel på vägen. Försök igen, eller mejla oss på ' +
      `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> så tar vi det därifrån.`;
    status.hidden = false;
    submit.disabled = false;
    submit.textContent = label;
  }
}

// Två saker styr hur det här anropet ser ut, och båda är avsiktliga.
//
// text/plain gör inskicket till en "simple request". Då hoppar webbläsaren
// över OPTIONS-preflighten, som varken Power Automate eller Logic Apps svarar
// korrekt på — kroppen är fortfarande JSON och flödet läser den med
// json(triggerBody()). Skickar man application/json faller allt på CORS.
//
// Omtagen kan skicka samma lead två gånger: landar anropet men svaret inte
// kommer tillbaka ser det likadant ut som ett rent fel. Därför bär varje lead
// ett lead_id, och flödet skriver aldrig samma id till listan två gånger.
// Ett dubblettförsök är billigare än ett tappat lead.
async function postLead(payload) {
  const body = JSON.stringify(payload);
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) await wait(800 * attempt);
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body,
        keepalive: true,
      });
      if (response.ok) return;
      // 4xx betyder att flödet sa nej — fler försök ger samma svar.
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Flödet avvisade leadet (HTTP ${response.status})`);
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (error.message?.startsWith('Flödet avvisade')) throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error('Okänt fel');
}

// Nästa steg visas först när svaren är inne, så leadet aldrig går förlorat
// för att någon klickar vidare direkt.
function showNextSteps(form) {
  form.hidden = true;
  el('next-steps').hidden = false;
}
