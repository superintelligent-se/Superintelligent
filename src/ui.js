import { isMuted, setMuted, sfx } from './audio.js';
import { renderAvatarCanvas } from './avatars.js';
import { renderCoinCanvas, renderGearCanvas } from './pixelart.js';
import { COINS_PER_DIMENSION, DIMENSIONS, QUESTIONS, ROLES } from './data/gameData.js';
import { answeredCount, coinsEarned, state, submissionPayload } from './state.js';

// Klistra in endpointen från formtjänsten här för att börja samla leads på riktigt.
const FORM_ENDPOINT = '';

// Vart prospektet skickas efter att svaren lämnats. Mötet är huvudvägen,
// träningen ett mindre alternativ för den som hellre börjar själv.
const BOOKING_URL = 'https://superintelligent.se/boka';
const TRAINING_URL = 'https://superintelligent.se/traning';

const el = (id) => document.getElementById(id);

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

export function showRoleSelect(onPick) {
  const container = el('role-buttons');
  container.innerHTML = '';
  for (const role of ROLES) {
    const button = document.createElement('button');
    button.className = 'choice role';
    button.type = 'button';

    button.appendChild(renderAvatarCanvas(role.id, 4));

    const text = document.createElement('span');
    text.innerHTML = `${role.label}<span class="role-blurb">${role.blurb}</span>`;
    button.appendChild(text);

    button.addEventListener('click', () => {
      state.role = role;
      el('overlay-role').hidden = true;
      showHowTo(onPick);
    });
    container.appendChild(button);
  }
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
    Ungefär som att ta in oss: rådgivning i toppen och AI-träning i hela
    organisationen samtidigt, i stället för att famla er fram i två år.
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

function showHowTo(onDone) {
  const overlay = el('overlay-howto');
  overlay.hidden = false;

  el('howto-start').addEventListener(
    'click',
    () => {
      overlay.hidden = true;
      el('hud').hidden = false;
      el('sound-toggle').hidden = false;
      sfx.zone();
      onDone();
    },
    { once: true },
  );
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

// Dimension 1-2 är grunden alla måste ha, 3-5 är där ni kan dra ifrån.
const GROUPS = [
  { heading: 'Basnivå', ids: ['policy', 'data'] },
  { heading: 'Förmåga & riktning', ids: ['formaga', 'agarskap', 'mojlighet'] },
];

export function buildHud() {
  const bars = el('hud-bars');
  bars.innerHTML = '';

  for (const group of GROUPS) {
    const heading = document.createElement('div');
    heading.className = 'hud-heading';
    heading.textContent = group.heading;
    bars.appendChild(heading);

    for (const id of group.ids) {
      const dimension = DIMENSIONS.find((d) => d.id === id);
      const row = document.createElement('div');
      row.className = 'hud-row';

      const label = document.createElement('span');
      label.className = 'hud-label';
      label.textContent = dimension.label;

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
      gear.appendChild(renderGearCanvas(GEAR_ICONS[dimension.gear], 2));

      row.append(label, track, gear);
      bars.appendChild(row);
    }
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
    // Den som tog röret har inga svar att analysera. Säg det rakt ut i
    // stället för att låtsas om en profil som inte finns.
    el('overlay-end').querySelector('h1').textContent = 'Du tog röret!';
    el('end-intro').textContent =
      'Inga svar den här gången — du hoppade rakt till slutet. Det säger egentligen allt vi behöver veta för ett första samtal: ni vill komma igång, inte kartlägga. Lämna dina uppgifter så tar vi frågorna när vi ses.';
    el('lead-submit').textContent = 'Skicka och boka samtal';
  }

  el('overlay-end').hidden = false;
  // Spelet ska sluta äta W, A, D och mellanslag så fälten går att fylla i.
  setGameInput(false);
  el('book-link').href = BOOKING_URL;
  el('training-link').href = TRAINING_URL;

  el('lead-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const contact = Object.fromEntries(new FormData(form).entries());
    const payload = submissionPayload(contact);
    const status = el('lead-status');

    if (!FORM_ENDPOINT) {
      console.info('Lead payload (ingen endpoint konfigurerad ännu):', payload);
      status.textContent = 'Tack! (Testläge — svaren loggades i webbläsarkonsolen.)';
      status.hidden = false;
      showNextSteps(form);
      return;
    }

    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      status.textContent = 'Tack! Dina svar är skickade.';
      showNextSteps(form);
    } catch {
      status.textContent = 'Något gick fel — försök igen eller mejla oss direkt.';
    }
    status.hidden = false;
  });
}

// Nästa steg visas först när svaren är inne, så leadet aldrig går förlorat
// för att någon klickar vidare direkt.
function showNextSteps(form) {
  form.hidden = true;
  el('next-steps').hidden = false;
}
