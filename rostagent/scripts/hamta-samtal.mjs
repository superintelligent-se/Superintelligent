#!/usr/bin/env node
// Hämtar en kunds intervjuer från ElevenLabs och visar status.
//
//   node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>
//   node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id> --avsluta
//
// Varje samtal sparas som <conversation_id>.json (utskrift, fält och metadata,
// inte ljud) och en rad i sammanstallning.json. data/ är gitignorerad.
//
// Finns deltagare.json (från lankar.mjs) visas vem som inte har genomfört
// intervjun, för påminnelser. --avsluta raderar kopplingen kod → e-post och
// koden ur de sparade samtalen. Kör det när intervjuperioden är slut.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.elevenlabs.io/v1/convai';
const JSON_FALT = ['uppgifter_json', 'rollsvar_json'];
const MIN_PER_ROLL = 3;
const MIN_PER_FORETAG = 10;

const args = process.argv.slice(2);
const avsluta = args.includes('--avsluta');
const [agentId, kundId] = args.filter((a) => !a.startsWith('--'));
// Nyckeln ligger i macOS nyckelring så att den aldrig behöver skrivas i en fil
// eller i chatten: security add-generic-password -a "$USER" -s elevenlabs-api -w
const apiKey = process.env.ELEVENLABS_API_KEY ?? nyckelring();

function nyckelring() {
  try {
    return execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api', '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

if (!agentId || !kundId) {
  console.error('Användning: node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id> [--avsluta]');
  process.exit(1);
}

const utmapp = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', kundId);
const deltagarfil = join(utmapp, 'deltagare.json');

if (avsluta) {
  await avslutaPerioden();
  process.exit(0);
}

if (!apiKey) {
  console.error('Ingen API-nyckel. Lägg den i nyckelringen: security add-generic-password -a "$USER" -s elevenlabs-api -w');
  process.exit(1);
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
    const q = new URLSearchParams({ agent_id: agentId, page_size: '100' });
    if (cursor) q.set('cursor', cursor);
    const sida = await api(`/conversations?${q}`);
    samtal.push(...sida.conversations);
    cursor = sida.has_more ? sida.next_cursor : undefined;
  } while (cursor);
  return samtal;
}

await mkdir(utmapp, { recursive: true });

const sammanstallning = [];
for (const { conversation_id: id } of await allaSamtal()) {
  const samtal = await api(`/conversations/${id}`);
  const variabler = samtal.conversation_initiation_client_data?.dynamic_variables ?? {};
  if (variabler.kund_id !== kundId) continue;

  await writeFile(join(utmapp, `${id}.json`), JSON.stringify(samtal, null, 2));

  const rad = {
    conversation_id: id,
    start: samtal.metadata?.start_time_unix_secs
      ? new Date(samtal.metadata.start_time_unix_secs * 1000).toISOString()
      : null,
    sekunder: samtal.metadata?.call_duration_secs ?? null,
    roll_lank: variabler.roll ?? null,
    deltagare: variabler.deltagare && variabler.deltagare !== 'ingen' ? variabler.deltagare : null,
    utvardering: Object.fromEntries(
      Object.entries(samtal.analysis?.evaluation_criteria_results ?? {}).map(([k, v]) => [k, v.result]),
    ),
  };

  for (const [falt, resultat] of Object.entries(samtal.analysis?.data_collection_results ?? {})) {
    let varde = resultat.value;
    if (JSON_FALT.includes(falt) && typeof varde === 'string') {
      try {
        varde = JSON.parse(varde);
      } catch {
        console.warn(`${id}: ${falt} är inte giltig JSON — läs utskriften i ${id}.json`);
      }
    }
    rad[falt] = varde;
  }
  sammanstallning.push(rad);
}

await writeFile(join(utmapp, 'sammanstallning.json'), JSON.stringify(sammanstallning, null, 2));
console.log(`${sammanstallning.length} samtal sparade i ${utmapp}\n`);

// Ett genomfört samtal per person räknas. Pratar någon två gånger används det
// mest kompletta i analysen; de övriga flaggas.
const genomforda = sammanstallning.filter((r) => r.samtycke && r.komplett);
const perPerson = new Map();
for (const r of genomforda) if (r.deltagare) perPerson.set(r.deltagare, [...(perPerson.get(r.deltagare) ?? []), r]);
const dubbletter = [...perPerson.values()].filter((l) => l.length > 1);
const unika = genomforda.length - dubbletter.reduce((n, l) => n + l.length - 1, 0);

const uppdrag = existsSync(join(utmapp, 'uppdrag.json'))
  ? JSON.parse(await readFile(join(utmapp, 'uppdrag.json'), 'utf8'))
  : null;
if (uppdrag) {
  const dag = (d) => new Date(`${d}T00:00:00`);
  const idag = dag(new Date().toISOString().slice(0, 10));
  const totalt = Math.round((dag(uppdrag.sista_dag) - dag(uppdrag.skapad)) / 864e5);
  const gatt = Math.round((idag - dag(uppdrag.skapad)) / 864e5);
  const kvar = Math.round((dag(uppdrag.sista_dag) - idag) / 864e5);
  console.log(`${uppdrag.foretag}: dag ${gatt} av ${totalt}, ${kvar >= 0 ? `${kvar} dagar kvar` : `stängde för ${-kvar} dagar sedan`} (sista dag ${uppdrag.sista_dag})`);
}

const deltagare = existsSync(deltagarfil) ? JSON.parse(await readFile(deltagarfil, 'utf8')) : null;
const roller = deltagare ? [...new Set(deltagare.map((d) => d.roll))] : [...new Set(genomforda.map((r) => r.roll ?? r.roll_lank))];

console.log(`Genomförda: ${unika}${deltagare ? ` av ${deltagare.length} inbjudna` : ''}${unika < MIN_PER_FORETAG ? `  ← under ${MIN_PER_FORETAG}, räcker inte för assessmenten` : ''}`);
for (const roll of roller) {
  const klara = new Set(genomforda.filter((r) => (r.roll_lank ?? r.roll) === roll).map((r) => r.deltagare ?? r.conversation_id)).size;
  const inbjudna = deltagare?.filter((d) => d.roll === roll).length;
  const varning = klara < MIN_PER_ROLL ? `  ← färre än ${MIN_PER_ROLL}, slås ihop vid redovisning` : '';
  console.log(`  ${roll}: ${klara}${inbjudna ? ` av ${inbjudna}` : ''}${varning}`);
}
if (dubbletter.length) console.log(`\n${dubbletter.length} person(er) har genomfört mer än en gång. Det mest kompletta samtalet används.`);

const fel = sammanstallning.filter((r) => r.utvardering?.inga_rad === 'failure');
if (fel.length) console.log(`\nLäs i sin helhet, agenten gav råd: ${fel.map((r) => r.conversation_id).join(', ')}`);

if (deltagare) {
  const klara = new Set(genomforda.map((r) => r.deltagare));
  const pabörjade = new Set(sammanstallning.filter((r) => r.deltagare && !klara.has(r.deltagare)).map((r) => r.deltagare));
  const ejKlara = deltagare.filter((d) => !klara.has(d.kod));
  await writeFile(join(utmapp, 'paminnelser.json'), JSON.stringify(ejKlara.map((d) => ({ ...d, paborjat: pabörjade.has(d.kod) })), null, 2));
  console.log(`\n${ejKlara.length} har inte genomfört intervjun (${[...pabörjade].length} har påbörjat). Listan för påminnelser ligger i paminnelser.json.`);
}

async function avslutaPerioden() {
  for (const fil of ['deltagare.json', 'paminnelser.json']) {
    if (existsSync(join(utmapp, fil))) await rm(join(utmapp, fil));
  }
  // Koden i de sparade samtalen pekar inte längre på någon, men den tas bort
  // så att ingen kopia av deltagarfilen kan kopplas ihop med svaren.
  let rensade = 0;
  for (const fil of (await readdir(utmapp)).filter((f) => f.endsWith('.json'))) {
    const sokvag = join(utmapp, fil);
    const innehall = JSON.parse(await readFile(sokvag, 'utf8'));
    const lista = Array.isArray(innehall) ? innehall : [innehall];
    let andrad = false;
    for (const post of lista) {
      if (post.deltagare) { post.deltagare = null; andrad = true; }
      const vars = post.conversation_initiation_client_data?.dynamic_variables;
      if (vars?.deltagare) { delete vars.deltagare; andrad = true; }
    }
    if (andrad) { await writeFile(sokvag, JSON.stringify(innehall, null, 2)); rensade++; }
  }
  console.log(`Kopplingen kod → e-post är raderad för ${kundId}. ${rensade} filer rensade.`);
  console.log('Radera nu samtalen i ElevenLabs, eller låt retention (60 dagar) göra det. Där finns koden kvar tills dess.');
}
