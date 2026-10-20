#!/usr/bin/env node
// Startar en intervjuomgång för ett företag.
//
//   node rostagent/kund/ny-omgang.mjs <domän> "<Företag>" <sista_dag> [grupp=antal ...]
//
//   node rostagent/kund/ny-omgang.mjs fastighetsbyran.se "Fastighetsbyrån Lund" 2026-11-07 ledning=2 chef=3 medarbetare=12
//
// Skriver data/<domän>/uppdrag.json, som hamta-samtal.mjs använder för period,
// sökord och hur många som bjudits in per rollgrupp, och skriver ut länken.
// Länken är densamma för alla — det finns inget per person att skapa.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRUPPER = ['ledning', 'chef', 'it_data', 'hr', 'medarbetare'];

const [adress, foretag, sistaDag, ...antal] = process.argv.slice(2);
const domän = String(adress ?? '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[/?#].*$/, '');

if (!domän.includes('.') || !foretag || !/^\d{4}-\d{2}-\d{2}$/.test(sistaDag ?? '')) {
  console.error('Användning: node rostagent/kund/ny-omgang.mjs <domän> "<Företag>" <ÅÅÅÅ-MM-DD> [grupp=antal ...]');
  process.exit(1);
}

const inbjudna = {};
for (const par of antal) {
  const [grupp, n] = par.split('=');
  if (!GRUPPER.includes(grupp) || !(Number(n) > 0)) {
    console.error(`"${par}" — grupp ska vara en av ${GRUPPER.join(', ')}`);
    process.exit(1);
  }
  inbjudna[grupp] = Number(n);
}

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { agent_id: agentId } = JSON.parse(await readFile(join(rot, 'config.json'), 'utf8'));
const utmapp = join(rot, 'data', domän);
const fil = join(utmapp, 'uppdrag.json');
if (existsSync(fil)) {
  console.error(`${fil} finns redan. Ändra i den direkt.`);
  process.exit(1);
}

await mkdir(utmapp, { recursive: true });
const uppdrag = {
  foretag,
  domän,
  start: new Date().toISOString().slice(0, 10),
  sista_dag: sistaDag,
  inbjudna_per_grupp: inbjudna,
  inkludera: [],
  exkludera: [],
};
await writeFile(fil, JSON.stringify(uppdrag, null, 2));

const totalt = Object.values(inbjudna).reduce((a, b) => a + b, 0);
console.log(`\n${foretag} (${domän}), ${uppdrag.start} – ${sistaDag}`);
if (totalt && totalt < 10) console.log(`Obs: ${totalt} inbjudna. Assessmenten kräver minst 10 genomförda intervjuer.`);
console.log(`\nLänk till alla: ${agentId ? `https://elevenlabs.io/app/talk-to?agent_id=${agentId}` : '(fyll i agent_id i rostagent/config.json)'}`);
console.log(`Sparat i ${fil}`);
