#!/usr/bin/env node
// Hämtar en kunds intervjuer från ElevenLabs till rostagent/data/<kund_id>/.
//
//   ELEVENLABS_API_KEY=... node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>
//
// Varje samtal sparas som <conversation_id>.json (hela svaret från API:t,
// inklusive utskrift) och en rad i sammanstallning.json med datainsamlingens
// fält. data/ är gitignorerad — intervjuerna får aldrig hamna i repot.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.elevenlabs.io/v1/convai';
const JSON_FALT = ['uppgifter_json', 'rollsvar_json'];

const [agentId, kundId] = process.argv.slice(2);
const apiKey = process.env.ELEVENLABS_API_KEY;

if (!agentId || !kundId) {
  console.error('Användning: node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>');
  process.exit(1);
}
if (!apiKey) {
  console.error('Sätt miljövariabeln ELEVENLABS_API_KEY.');
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

const utmapp = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', kundId);
await mkdir(utmapp, { recursive: true });

const sammanstallning = [];
const lista = await allaSamtal();

for (const { conversation_id: id } of lista) {
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

const perRoll = {};
for (const rad of sammanstallning) {
  const roll = rad.roll ?? rad.roll_lank ?? 'okänd';
  perRoll[roll] = (perRoll[roll] ?? 0) + 1;
}

console.log(`${sammanstallning.length} samtal sparade i ${utmapp}`);
for (const [roll, antal] of Object.entries(perRoll)) {
  const varning = antal < 3 ? '  ← färre än 3, slå ihop med närliggande roll innan redovisning' : '';
  console.log(`  ${roll}: ${antal}${varning}`);
}
