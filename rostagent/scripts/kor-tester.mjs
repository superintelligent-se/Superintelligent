#!/usr/bin/env node
// Kör de simulerade testerna i tester/simuleringar.json mot agenten.
//
//   node rostagent/scripts/kor-tester.mjs                 alla tester, en gång
//   node rostagent/scripts/kor-tester.mjs 3               alla tester, tre gånger
//   node rostagent/scripts/kor-tester.mjs 3 nej inga_rad  bara de här, tre gånger
//
// Testerna skapas i agentens Tests-flik första gången och när en definition
// ändras. ID:na sparas i tester/test-ids.json. Resultaten sparas i
// data/tester/ (gitignorerad). En AI spelar medarbetaren i text — rösten,
// taligenkänningen och turtagningen testas inte här, se testprotokoll.md.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.elevenlabs.io/v1/convai';
const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { agent_id: agentId } = JSON.parse(await readFile(join(rot, 'config.json'), 'utf8'));
const definitioner = JSON.parse(await readFile(join(rot, 'tester/simuleringar.json'), 'utf8'));
const idFil = join(rot, 'tester/test-ids.json');
const ids = existsSync(idFil) ? JSON.parse(await readFile(idFil, 'utf8')) : {};

const [antalArg, ...valda] = process.argv.slice(2);
const repeat = Number(antalArg) > 0 ? Number(antalArg) : 1;
const urval = [antalArg, ...valda].filter((a) => a && !(Number(a) > 0));
const att_kora = urval.length ? definitioner.filter((d) => urval.includes(d.key)) : definitioner;

let apiKey = process.env.ELEVENLABS_API_KEY;
try {
  apiKey ??= execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api', '-w'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {}
if (!apiKey) {
  console.error('Ingen API-nyckel i nyckelringen.');
  process.exit(1);
}

async function api(path, metod = 'GET', kropp) {
  const res = await fetch(`${API}${path}`, {
    method: metod,
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: kropp ? JSON.stringify(kropp) : undefined,
  });
  if (!res.ok) throw new Error(`${metod} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

// Testerna i ElevenLabs börjar ändå med agentens första meddelande, men
// med en historik måste det stå med för att samtalet ska hänga ihop.
const forsta = (await readFile(join(rot, 'agent/forsta-meddelande.md'), 'utf8')).split('\n---\n')[1].trim().split('\n\n')[0];

function kropp(d) {
  const historik = d.chat_history
    ? [{ role: 'agent', message: forsta }, { role: 'user', message: 'Ja, det går bra.' }, ...d.chat_history]
    : [];
  return {
    name: `[${d.key}] ${d.name}`,
    type: 'simulation',
    simulation_scenario: d.scenario,
    success_conditions: d.success_conditions,
    simulation_max_turns: d.max_turns,
    chat_history: historik.map((m, i) => ({ ...m, time_in_call_secs: i * 8 })),
  };
}

for (const d of att_kora) {
  const k = kropp(d);
  const hash = createHash('sha256').update(JSON.stringify(k)).digest('hex').slice(0, 12);
  if (ids[d.key]?.hash === hash) continue;
  const { id } = await api('/agent-testing/create', 'POST', k);
  ids[d.key] = { id, hash };
  console.log(`Skapade test ${d.key}`);
}
await writeFile(idFil, `${JSON.stringify(ids, null, 2)}\n`);

const start = await api(`/agents/${agentId}/run-tests`, 'POST', {
  tests: att_kora.map((d) => ({ test_id: ids[d.key].id })),
  repeat_count: repeat,
});
console.log(`Kör ${att_kora.length} tester × ${repeat} (${start.id})...`);

let resultat = start;
for (let i = 0; i < 120; i++) {
  if (resultat.test_runs?.length && resultat.test_runs.every((r) => r.status !== 'pending')) break;
  await new Promise((r) => setTimeout(r, 10000));
  resultat = await api(`/test-invocations/${start.id}`);
}

const utmapp = join(rot, 'data/tester');
await mkdir(utmapp, { recursive: true });
const fil = join(utmapp, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
await writeFile(fil, JSON.stringify(resultat, null, 2));

const nyckelFor = Object.fromEntries(Object.entries(ids).map(([k, v]) => [v.id, k]));
let credits = 0;
const perTest = {};
for (const run of resultat.test_runs ?? []) {
  credits += run.credits_used ?? 0;
  const key = nyckelFor[run.test_id] ?? run.test_name;
  (perTest[key] ??= []).push(run);
}

console.log('');
for (const d of att_kora) {
  const runs = perTest[d.key] ?? [];
  const godkanda = runs.filter((r) => r.status === 'passed').length;
  const vantar = runs.filter((r) => r.status === 'pending').length;
  console.log(`${godkanda === runs.length && runs.length ? '✓' : '✗'}  ${d.name}: ${godkanda} av ${runs.length}${vantar ? ` (${vantar} väntar)` : ''}`);
  for (const r of runs.filter((r) => r.status === 'failed')) {
    const motivering = r.condition_result?.rationale?.summary ?? r.condition_result?.rationale?.messages?.join(' ') ?? '';
    if (motivering) console.log(`     ${motivering.slice(0, 400)}`);
  }
}
console.log(`\nCredits: ${credits}. Fullständiga samtal i ${fil}`);
