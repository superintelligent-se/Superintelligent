#!/usr/bin/env node
// Hämtar ett företags intervjuer från ElevenLabs och visar status.
//
//   node rostagent/scripts/hamta-samtal.mjs <domän>
//
// Länken bär ingen information, så samtalen kopplas till företaget via
// webbadressen personen sa (fältet webbplats). Samtal under perioden där
// adressen saknas eller hörts fel men namnet liknar listas för hand-koppling:
// lägg deras conversation_id i "inkludera" i data/<domän>/uppdrag.json.
//
// Varje samtal sparas som <conversation_id>.json (utskrift, fält och metadata,
// inte ljud) och en rad i sammanstallning.json. data/ är gitignorerad.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDUSTRIES } from '../../src/data/gameData.js';

const API = 'https://api.elevenlabs.io/v1/convai';
const JSON_FALT = ['uppgifter_json', 'rollsvar_json'];
const MIN_PER_ROLL = 3;
const MIN_PER_FORETAG = 10;

// Spelets roller grupperade så som systemprompten väljer block R.
const ROLLGRUPPER = {
  ledning: ['ledning', 'vd', 'agare', 'franchise', 'hotelldirektor', 'entreprenor'],
  chef: ['chef', 'avdelningschef', 'affarsomrade', 'kontorschef', 'teamledare'],
  it_data: ['cio', 'dataai'],
  hr: ['hr'],
  medarbetare: ['medarbetare', 'maklare', 'saljstod', 'reception', 'event', 'annat'],
};
const ROLLNAMN = Object.fromEntries(INDUSTRIES.flatMap((i) => i.roles.map((r) => [r.id, r.label])));
const gruppFor = (roll) => Object.keys(ROLLGRUPPER).find((g) => ROLLGRUPPER[g].includes(roll)) ?? 'medarbetare';

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(join(rot, 'config.json'), 'utf8'));
const domän = normalisera(process.argv[2] ?? '');

if (!config.agent_id) {
  console.error('Fyll i agent_id i rostagent/config.json.');
  process.exit(1);
}
if (!domän) {
  console.error('Användning: node rostagent/scripts/hamta-samtal.mjs <domän>, t.ex. fastighetsbyran.se');
  process.exit(1);
}

// Nyckeln ligger i macOS nyckelring så att den aldrig behöver skrivas i en fil
// eller i chatten: security add-generic-password -a "$USER" -s elevenlabs-api -w
const apiKey = process.env.ELEVENLABS_API_KEY ?? nyckelring();
if (!apiKey) {
  console.error('Ingen API-nyckel. Lägg den i nyckelringen: security add-generic-password -a "$USER" -s elevenlabs-api -w');
  process.exit(1);
}

function nyckelring() {
  try {
    return execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api', '-w'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

function normalisera(adress) {
  return String(adress)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, '');
}

// "Fastighetsbyrån Lund AB" och "fastighetsbyran.se" ska kunna mötas.
function nyckelord(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\.(se|com|nu|net|org|eu|io)\b/g, '')
    .split(/[^a-z0-9]+/)
    .filter((o) => o.length > 2 && !['och', 'the', 'group', 'sverige', 'sweden'].includes(o));
}

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} för ${path}: ${await res.text()}`);
  return res.json();
}

async function allaSamtal() {
  const samtal = [];
  let cursor;
  do {
    const q = new URLSearchParams({ agent_id: config.agent_id, page_size: '100' });
    if (cursor) q.set('cursor', cursor);
    const sida = await api(`/conversations?${q}`);
    samtal.push(...sida.conversations);
    cursor = sida.has_more ? sida.next_cursor : undefined;
  } while (cursor);
  return samtal;
}

const utmapp = join(rot, 'data', domän);
await mkdir(utmapp, { recursive: true });
const uppdragsfil = join(utmapp, 'uppdrag.json');
const uppdrag = existsSync(uppdragsfil) ? JSON.parse(await readFile(uppdragsfil, 'utf8')) : {};
const inkludera = new Set(uppdrag.inkludera ?? []);
const exkludera = new Set(uppdrag.exkludera ?? []);
const fran = uppdrag.start ? new Date(`${uppdrag.start}T00:00:00`).getTime() / 1000 : 0;
const till = uppdrag.sista_dag ? new Date(`${uppdrag.sista_dag}T23:59:59`).getTime() / 1000 : Infinity;
const sokord = new Set([...nyckelord(domän), ...nyckelord(uppdrag.foretag ?? '')]);

const sammanstallning = [];
const kandidater = [];

for (const { conversation_id: id, start_time_unix_secs: start } of await allaSamtal()) {
  if (exkludera.has(id)) continue;
  if (!inkludera.has(id) && start && (start < fran || start > till)) continue;

  const samtal = await api(`/conversations/${id}`);
  const falt = Object.fromEntries(
    Object.entries(samtal.analysis?.data_collection_results ?? {}).map(([k, v]) => [k, v.value]),
  );
  const traff = normalisera(falt.webbplats ?? '') === domän || inkludera.has(id);

  if (!traff) {
    const liknar = nyckelord(`${falt.foretag ?? ''} ${falt.webbplats ?? ''}`).some((o) => sokord.has(o));
    if (liknar || (!falt.webbplats && !falt.foretag)) {
      kandidater.push({
        id,
        start: start ? new Date(start * 1000).toISOString().slice(0, 16) : '',
        foretag: falt.foretag,
        webbplats: falt.webbplats,
      });
    }
    continue;
  }

  await writeFile(join(utmapp, `${id}.json`), JSON.stringify(samtal, null, 2));

  const startSek = samtal.metadata?.start_time_unix_secs ?? start;
  const rad = {
    conversation_id: id,
    start: startSek ? new Date(startSek * 1000).toISOString() : null,
    sekunder: samtal.metadata?.call_duration_secs ?? null,
    utvardering: Object.fromEntries(
      Object.entries(samtal.analysis?.evaluation_criteria_results ?? {}).map(([k, v]) => [k, v.result]),
    ),
  };
  for (const [namn, varde] of Object.entries(falt)) {
    rad[namn] = varde;
    if (JSON_FALT.includes(namn) && typeof varde === 'string') {
      try {
        rad[namn] = JSON.parse(varde);
      } catch {
        console.warn(`${id}: ${namn} är inte giltig JSON — läs utskriften i ${id}.json`);
      }
    }
  }
  rad.rollgrupp = gruppFor(rad.roll);
  if (rad.roll && !ROLLNAMN[rad.roll]) console.warn(`${id}: okänd roll "${rad.roll}" — räknas som medarbetare`);
  sammanstallning.push(rad);
}

await writeFile(join(utmapp, 'sammanstallning.json'), JSON.stringify(sammanstallning, null, 2));
console.log(`${uppdrag.foretag ?? domän}: ${sammanstallning.length} samtal sparade i ${utmapp}\n`);

if (uppdrag.start && uppdrag.sista_dag) {
  const dag = (d) => new Date(`${d}T00:00:00`);
  const idag = dag(new Date().toISOString().slice(0, 10));
  const totalt = Math.round((dag(uppdrag.sista_dag) - dag(uppdrag.start)) / 864e5) + 1;
  const gatt = Math.round((idag - dag(uppdrag.start)) / 864e5) + 1;
  const kvar = Math.round((dag(uppdrag.sista_dag) - idag) / 864e5);
  console.log(
    `Dag ${Math.min(gatt, totalt)} av ${totalt}, ` +
      `${kvar >= 0 ? `${kvar} dagar kvar` : `stängde för ${-kvar} dagar sedan`} (sista dag ${uppdrag.sista_dag})`,
  );
}

const genomforda = sammanstallning.filter((r) => r.samtycke && r.komplett);
const inbjudna = uppdrag.inbjudna_per_grupp ?? {};
const antalInbjudna = Object.values(inbjudna).reduce((a, b) => a + b, 0);
console.log(
  `Genomförda: ${genomforda.length}${antalInbjudna ? ` av ${antalInbjudna} inbjudna` : ''}` +
    `${genomforda.length < MIN_PER_FORETAG ? `  ← under ${MIN_PER_FORETAG}, räcker inte för assessmenten` : ''}`,
);
for (const grupp of Object.keys(ROLLGRUPPER)) {
  const iGrupp = genomforda.filter((r) => r.rollgrupp === grupp);
  if (!iGrupp.length && !inbjudna[grupp]) continue;
  const roller = [...new Set(iGrupp.map((r) => ROLLNAMN[r.roll] ?? r.roll))].join(', ');
  const varning = iGrupp.length < MIN_PER_ROLL ? `  ← färre än ${MIN_PER_ROLL}, slås ihop vid redovisning` : '';
  const over = inbjudna[grupp] && iGrupp.length > inbjudna[grupp] ? '  ← fler än inbjudna, kontrollera' : '';
  console.log(
    `  ${grupp}: ${iGrupp.length}${inbjudna[grupp] ? ` av ${inbjudna[grupp]}` : ''}` +
      `${roller ? ` (${roller})` : ''}${varning}${over}`,
  );
}

const avbrutna = sammanstallning.length - genomforda.length;
if (avbrutna) console.log(`\n${avbrutna} samtal avbröts eller tackade nej. De räknas inte.`);

const fel = sammanstallning.filter((r) => r.utvardering?.inga_rad === 'failure');
if (fel.length) console.log(`\nLäs i sin helhet, agenten gav råd: ${fel.map((r) => r.conversation_id).join(', ')}`);

if (kandidater.length) {
  console.log(`\n${kandidater.length} samtal under perioden kan höra hit men har annan eller ingen webbadress.`);
  console.log('Lyssna eller läs, och lägg id i "inkludera" eller "exkludera" i uppdrag.json:');
  for (const k of kandidater) {
    console.log(`  ${k.id}  ${k.start}  ${k.foretag || '(inget företag)'}  ${k.webbplats || '(ingen adress)'}`);
  }
}
