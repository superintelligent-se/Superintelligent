import { DIMENSIONS, QUESTIONS, ROLES } from './data/gameData.js';
import { answeredCount, dimensionFill, state, submissionPayload } from './state.js';

// Paste the Formspree (or equivalent) endpoint here to start collecting leads for real.
const FORM_ENDPOINT = '';

const el = (id) => document.getElementById(id);

export function showRoleSelect(onPick) {
  const container = el('role-buttons');
  container.innerHTML = '';
  for (const role of ROLES) {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.innerHTML = `${role.label}<span class="role-blurb">${role.blurb}</span>`;
    button.addEventListener('click', () => {
      state.role = role;
      el('overlay-role').hidden = true;
      el('hud').hidden = false;
      onPick(role);
    });
    container.appendChild(button);
  }
}

export function buildHud() {
  const bars = el('hud-bars');
  bars.innerHTML = '';
  for (const dimension of DIMENSIONS) {
    const row = document.createElement('div');
    row.className = 'hud-row';
    row.innerHTML = `
      <span class="hud-label">${dimension.label}</span>
      <span class="hud-track"><span class="hud-fill" id="fill-${dimension.id}" style="background:${dimension.color};color:${dimension.color}"></span></span>
    `;
    bars.appendChild(row);
  }
  updateHud();
}

export function updateHud() {
  for (const dimension of DIMENSIONS) {
    el(`fill-${dimension.id}`).style.width = `${dimensionFill(dimension.id) * 100}%`;
  }
  el('hud-progress').textContent = `${answeredCount()} / ${QUESTIONS.length} frågetecken öppnade`;
}

export function showQuestion(question, onAnswer) {
  const dimension = DIMENSIONS.find((d) => d.id === question.dimension);
  const tag = el('question-dimension');
  tag.textContent = dimension.label;
  tag.style.color = dimension.color;
  el('question-text').textContent = question.text;

  const options = el('question-options');
  options.innerHTML = '';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.textContent = option.label;
    button.addEventListener('click', () => {
      el('overlay-question').hidden = true;
      onAnswer(index);
    });
    options.appendChild(button);
  });

  el('overlay-question').hidden = false;
}

export function showEnd() {
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
