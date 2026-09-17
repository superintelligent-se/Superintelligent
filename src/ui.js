import { isMuted, setMuted, sfx } from './audio.js';
import { renderAvatarCanvas } from './avatars.js';
import { renderCoinCanvas, renderGearCanvas } from './pixelart.js';
import { COINS_PER_DIMENSION, DIMENSIONS, QUESTIONS, ROLES } from './data/gameData.js';
import { answeredCount, coinsEarned, state, submissionPayload } from './state.js';

// Paste the Formspree (or equivalent) endpoint here to start collecting leads for real.
const FORM_ENDPOINT = '';

const el = (id) => document.getElementById(id);

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

export function showQuestion(question, previousIndex, onAnswer) {
  const dimension = DIMENSIONS.find((d) => d.id === question.dimension);
  const tag = el('question-dimension');
  tag.textContent = previousIndex === null ? dimension.label : `${dimension.label} · ändra svar`;
  tag.style.color = dimension.color;
  el('question-text').textContent = question.text;

  const options = el('question-options');
  options.innerHTML = '';

  let selected = previousIndex ?? 0;
  const buttons = question.options.map((option, index) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.innerHTML = `<span class="choice-marker">▸</span>${option.label}`;
    button.addEventListener('mouseenter', () => select(index));
    button.addEventListener('click', () => answer(index));
    options.appendChild(button);
    return button;
  });

  function select(index) {
    selected = index;
    buttons.forEach((button, i) => button.classList.toggle('selected', i === index));
  }

  function answer(index) {
    document.removeEventListener('keydown', onKeyDown);
    el('overlay-question').hidden = true;
    onAnswer(index);
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
      answer(selected);
    }
  }

  select(selected);
  document.addEventListener('keydown', onKeyDown);
  el('overlay-question').hidden = false;
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
    el('end-bonus').textContent = `Hoppbonus +${bonus}`;
    el('end-bonus').hidden = false;
  }

  el('overlay-end').hidden = false;

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
      return;
    }

    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      form.hidden = true;
      status.textContent = 'Tack! Vi hör av oss för din genomgång.';
    } catch {
      status.textContent = 'Något gick fel — försök igen eller mejla oss direkt.';
    }
    status.hidden = false;
  });
}
