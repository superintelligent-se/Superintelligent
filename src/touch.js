// Touch matas in i exakt samma ställen som tangentbordet: håll-lägen för
// vänster och höger, och engångstryck för hopp och ner. Spellogiken vet
// inte om vilket som användes.

const state = { left: false, right: false };
let jumpQueued = false;
let downQueued = false;

export const touchState = state;

export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

// Läses en gång per bildruta, precis som Phasers JustDown.
export function consumeJump() {
  const queued = jumpQueued;
  jumpQueued = false;
  return queued;
}

export function consumeDown() {
  const queued = downQueued;
  downQueued = false;
  return queued;
}

export function clearTouchInput() {
  state.left = false;
  state.right = false;
  jumpQueued = false;
  downQueued = false;
}

function bindHold(id, set) {
  const button = document.getElementById(id);
  const press = (event) => {
    event.preventDefault();
    set(true);
    button.classList.add('pressed');
  };
  const release = (event) => {
    event.preventDefault();
    set(false);
    button.classList.remove('pressed');
  };

  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
}

function bindTap(id, queue) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    queue();
    button.classList.add('pressed');
  });
  const release = () => button.classList.remove('pressed');
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
}

export function initTouchControls() {
  if (!isTouchDevice()) return;

  document.getElementById('touch-controls').hidden = false;
  bindHold('touch-left', (down) => {
    state.left = down;
    if (down) state.right = false;
  });
  bindHold('touch-right', (down) => {
    state.right = down;
    if (down) state.left = false;
  });
  bindTap('touch-jump', () => {
    jumpQueued = true;
  });
  bindTap('touch-down', () => {
    downQueued = true;
  });
}

// Ner-knappen behövs bara när man står på röret.
export function setDownButtonVisible(visible) {
  const button = document.getElementById('touch-down');
  if (button) button.classList.toggle('available', visible);
}
