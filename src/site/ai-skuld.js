// AI-skuld-kalkylatorn. Modellen och texterna kommer från repot
// superintelligent-se/roi (roi.superintelligent.se): antal tjänstemän gånger
// vald nivå ger kostnad per år, månad (år / 12) och dag (år / 365).
import './ai-skuld.css';

const LEVELS = [
  {
    id: 'cautious',
    value: 75000,
    label: 'Försiktig',
    info:
      'Konservativ uppskattning för organisationer som vill räkna lågt. Bygger på dokumenterade tidsvinster och passar när ni vill börja försiktigt men ändå evidensbaserat.',
    readAs:
      'Lägsta nivån i modellen. Fångar främst direkta tidsvinster och lämnar liten marginal för bredare kvalitets- och koordinationseffekter.',
  },
  {
    id: 'core',
    value: 100000,
    label: 'Normal',
    info:
      'Realistiskt huvudantagande för de flesta kunskapsintensiva verksamheter. Väger in hur komplexitet, arbetsflöden och varierande AI-mognad påverkar den faktiska alternativkostnaden.',
    readAs:
      'Huvudnivån i beslutsunderlaget. Passar när ni vill använda modellen som ett balanserat och praktiskt huvudantagande.',
  },
  {
    id: 'expanded',
    value: 125000,
    label: 'Hög potential',
    info:
      'För verksamheter där AI kan ge stor effekt i många återkommande arbetsmoment. Här fångas även bredare effekter som kvalitet, tempo, omarbete och koordineringsförluster.',
    readAs:
      'Den offensivaste nivån i modellen. Relevant när utebliven AI-användning även påverkar kvalitet, tempo, koordinering och andra ordningens värdeeffekter.',
  },
];

const DEFAULT_LEVEL = 'core';
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;

const kr = (value) =>
  `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(value)} kr`;

const $ = (id) => document.getElementById(id);
const input = $('employees');
const levelsEl = $('levels');
const tableEl = $('levels-table');

let levelId = DEFAULT_LEVEL;

function validate(raw) {
  if (raw === '') return 'Fyll i antal tjänstemän så visar vi vad bristande AI-användning kostar er.';
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'Ange ett giltigt antal tjänstemän för att få ett tydligt beslutsunderlag.';
  if (n === 0) return 'Skriv in minst 1 tjänsteman så ser ni hur snabbt små tidsförluster blir stora kostnader.';
  if (n < 0) return 'Negativa tal fungerar inte här. Ange faktiskt antal tjänstemän så räknar vi fram ett relevant underlag.';
  return '';
}

function renderLevels() {
  levelsEl.innerHTML = LEVELS.map(
    (level) => `
      <label class="level-opt">
        <input type="radio" name="level" value="${level.id}" ${level.id === levelId ? 'checked' : ''} />
        <span class="eb">${level.label}</span>
        <strong>${kr(level.value)}</strong>
        <span class="per">per tjänsteman och år</span>
      </label>`,
  ).join('');

  tableEl.innerHTML = LEVELS.map(
    (level) => `
      <tr data-level="${level.id}">
        <th scope="row">${level.label}<span class="eb badge">Vald nivå</span></th>
        <td>${kr(level.value)}</td>
        <td>${level.readAs}</td>
      </tr>`,
  ).join('');
}

function update() {
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[1];
  const raw = input.value.trim();
  const error = validate(raw);
  const annual = error ? 0 : Number(raw) * level.value;

  $('calc-error').textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  $('r-annual').textContent = kr(annual);
  $('r-month').textContent = kr(annual / MONTHS_PER_YEAR);
  $('r-day').textContent = kr(annual / DAYS_PER_YEAR);
  $('r-basis').textContent = `Beräkningen bygger på nivå ${level.label} (${kr(level.value)}) per tjänsteman och år.`;
  $('level-info').textContent = level.info;

  for (const row of tableEl.querySelectorAll('tr')) {
    row.classList.toggle('is-selected', row.dataset.level === level.id);
  }
}

renderLevels();
update();

input.addEventListener('input', update);
levelsEl.addEventListener('change', (event) => {
  levelId = event.target.value;
  update();
});
for (const chip of document.querySelectorAll('[data-preset]')) {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.preset;
    update();
  });
}
$('calc-form').addEventListener('submit', (event) => event.preventDefault());

// Underlaget är sidan själv i utskriftsläge: kalkylatorn, resultatet och
// metoden. Webbläsarens "Spara som PDF" gör resten.
$('print').addEventListener('click', () => {
  for (const d of document.querySelectorAll('#metod details')) d.open = true;
  window.print();
});
