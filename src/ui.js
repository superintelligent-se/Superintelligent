import { isMuted, setMuted, sfx } from './audio.js';
import { renderAvatarCanvas } from './avatars.js';
import { renderCoinCanvas } from './pixelart.js';
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

export function buildHud() {
  const bars = el('hud-bars');
  bars.innerHTML = '';
  for (const dimension of DIMENSIONS) {
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

    row.append(label, track);
    bars.appendChild(row);
  }
  updateHud();
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

export function showQuestion(question, onAnswer) {
  const dimension = DIMENSIONS.find((d) => d.id === question.dimension);
  const tag = el('question-dimension');
  tag.textContent = dimension.label;
  tag.style.color = dimension.color;
  el('question-text').textContent = question.text;

  const options = el('question-options');
  options.innerHTML = '';

  let selected = 0;
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
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (step) {
      event.preventDefault();
      select((selected + step + buttons.length) % buttons.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      answer(selected);
    }
  }

  select(0);
  document.addEventListener('keydown', onKeyDown);
  el('overlay-question').hidden = false;
}

let endShown = false;

export function showEnd() {
  // Slutskärmen är där leadet fångas — den får aldrig visas två gånger,
  // och aldrig utebli för att en animation frös när någon bytte flik.
  if (endShown) return;
  endShown = true;

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
