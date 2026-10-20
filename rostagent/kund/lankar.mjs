#!/usr/bin/env node
// Skapar intervjulänkar för en kund.
//
// Personliga länkar (det vanliga):
//   node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>" <sista_dag> <mottagare.csv>
//
//   mottagare.csv har en rad per person: e-post;roll
//   roll är en av agare, chef, maklare, saljstod, annan.
//
// Rollänkar utan uppföljning (för test, eller om kunden skickar själv):
//   node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>"
//
// Varje person får en slumpkod i länken. Kopplingen kod → e-post sparas bara i
// rostagent/data/<kund_id>/deltagare.json (gitignorerad) och raderas med
// hamta-samtal.mjs --avsluta när intervjuperioden är slut. Kunden får den aldrig.

import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROLLER = {
  agare: 'Ägare / Franchiseägare / VD',
  chef: 'Kontorschef / Teamledare',
  maklare: 'Mäklare',
  saljstod: 'Säljstöd / Koordinator / Assistent',
  annan: 'Annan roll',
};

const [agentId, kundId, foretag, sistaDag, csv] = process.argv.slice(2);

if (!agentId || !kundId || !foretag) {
  console.error('Användning: node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>" [<sista_dag> <mottagare.csv>]');
  process.exit(1);
}

// kund_id hamnar i en URL och som mappnamn under data/.
if (!/^[a-z0-9-]+$/.test(kundId)) {
  console.error('kund_id får bara innehålla a–z, 0–9 och bindestreck, t.ex. sf-lund-2026-10');
  process.exit(1);
}

function lank(roll, kod) {
  const url = new URL('https://elevenlabs.io/app/talk-to');
  url.searchParams.set('agent_id', agentId);
  url.searchParams.set('var_foretag', foretag);
  url.searchParams.set('var_roll', roll);
  url.searchParams.set('var_kund_id', kundId);
  // Agenten kräver att alla deklarerade variabler finns. Rollänkar får "ingen".
  url.searchParams.set('var_deltagare', kod ?? 'ingen');
  // %20 i stället för + — alla tolkar inte + som mellanslag i en query.
  return url.href.replaceAll('+', '%20');
}

if (!csv) {
  console.log(`\n${foretag} (${kundId}) – rollänkar, utan uppföljning per person\n`);
  for (const [roll, namn] of Object.entries(ROLLER)) console.log(`${namn}\n${lank(roll)}\n`);
  process.exit(0);
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(sistaDag ?? '')) {
  console.error('sista_dag ska skrivas ÅÅÅÅ-MM-DD');
  process.exit(1);
}

const utmapp = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', kundId);
const deltagarfil = join(utmapp, 'deltagare.json');
if (existsSync(deltagarfil)) {
  console.error(`${deltagarfil} finns redan. Lägg till personer för hand, eller radera filen om du vill börja om.`);
  process.exit(1);
}

const rader = (await readFile(csv, 'utf8'))
  .split(/\r?\n/)
  .map((r) => r.trim())
  .filter((r) => r && !r.startsWith('#'));

const deltagare = [];
const sedda = new Set();
for (const rad of rader) {
  const [epost, roll] = rad.split(/[;,\t]/).map((s) => s?.trim().toLowerCase());
  if (!epost?.includes('@') || !ROLLER[roll]) {
    console.error(`Hoppar över raden "${rad}" — förväntar e-post;roll med roll ${Object.keys(ROLLER).join('/')}`);
    continue;
  }
  if (sedda.has(epost)) continue;
  sedda.add(epost);
  // 8 tecken base64url ≈ 48 bitar. Gissningsbart bara i teorin, och koden ger
  // ingen åtkomst till något — den identifierar bara vem som pratat.
  const kod = randomBytes(6).toString('base64url');
  deltagare.push({ kod, epost, roll, lank: lank(roll, kod) });
}

await mkdir(utmapp, { recursive: true });
const uppdrag = { kund_id: kundId, foretag, agent_id: agentId, skapad: new Date().toISOString().slice(0, 10), sista_dag: sistaDag };
await writeFile(join(utmapp, 'uppdrag.json'), JSON.stringify(uppdrag, null, 2));
await writeFile(deltagarfil, JSON.stringify(deltagare, null, 2));

console.log(`\n${foretag} (${kundId}) – ${deltagare.length} personliga länkar, sista dag ${sistaDag}\n`);
for (const [roll, namn] of Object.entries(ROLLER)) {
  const iRoll = deltagare.filter((d) => d.roll === roll);
  if (!iRoll.length) continue;
  console.log(`${namn}: ${iRoll.length}${iRoll.length < 3 ? '  ← färre än 3, slås ihop vid redovisning' : ''}`);
}
if (deltagare.length < 10) console.log(`\nObs: ${deltagare.length} inbjudna. Assessmenten kräver minst 10 genomförda intervjuer.`);
console.log(`\nSparat i ${deltagarfil}`);
