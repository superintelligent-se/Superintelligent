#!/usr/bin/env node
// Visar skillnaden mellan texterna i agent/ och agenten i ElevenLabs, och
// skickar dem med --skicka.
//
//   node rostagent/scripts/synka-agent.mjs           visa bara
//   node rostagent/scripts/synka-agent.mjs --skicka  uppdatera agenten
//
// Filerna är sanningskällan. Synkas: systemprompt, första meddelande,
// End call-verktygets beskrivning och utvärderingskriterierna. Övriga inställningar ändras i gränssnittet
// och kontrolleras med kontrollera-agent.mjs. Före varje skick sparas agentens
// inställningar i data/agent-backup/ så att det går att backa.

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// End call har en egen beskrivning som modellen läser när den väljer verktyg.
// Utan den lade GPT-6 Luna ibland på direkt efter att ha ställt en fråga.
const END_CALL_BESKRIVNING =
  'Avslutar samtalet. Används bara när personen har sagt nej till att delta, när personen säger att hen vill sluta, ' +
  'eller efter att du har tackat för intervjun. Anropa aldrig i samma tur som du ställer en fråga, och aldrig för att ' +
  'ett svar dröjer.';

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { agent_id: agentId } = JSON.parse(await readFile(join(rot, 'config.json'), 'utf8'));
const skicka = process.argv.includes('--skicka');

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

const url = `https://api.elevenlabs.io/v1/convai/agents/${agentId}`;
const agent = await (await fetch(url, { headers: { 'xi-api-key': apiKey } })).json();

const efterStreck = async (fil) => (await readFile(join(rot, fil), 'utf8')).split('\n---\n')[1].trim();
const onskat = {
  systemprompt: await efterStreck('agent/systemprompt.md'),
  forsta: (await efterStreck('agent/forsta-meddelande.md')).split('\n\n')[0],
  end_call: END_CALL_BESKRIVNING,
  utvardering: [...(await readFile(join(rot, 'agent/utvardering.md'), 'utf8')).matchAll(/^\| `([a-z_]+)` \| (.+) \|$/gm)]
    .map(([, namn, text]) => `${namn}: ${text}`)
    .join('\n'),
};
const nu = {
  systemprompt: agent.conversation_config.agent.prompt.prompt,
  forsta: agent.conversation_config.agent.first_message,
  end_call: agent.conversation_config.agent.prompt.built_in_tools?.end_call?.description ?? null,
  utvardering: (agent.platform_settings.evaluation?.criteria ?? []).map((k) => `${k.name}: ${k.conversation_goal_prompt}`).join('\n'),
};

function skillnad(a, b) {
  const ra = String(a ?? '').split('\n');
  const rb = String(b ?? '').split('\n');
  const ut = [];
  for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
    if (ra[i] === rb[i]) continue;
    if (ra[i] !== undefined) ut.push(`    - ${ra[i]}`);
    if (rb[i] !== undefined) ut.push(`    + ${rb[i]}`);
  }
  return ut;
}

const andrade = Object.keys(onskat).filter((k) => nu[k] !== onskat[k]);
if (!andrade.length) {
  console.log('Agenten stämmer med filerna.');
  process.exit(0);
}
for (const k of andrade) {
  const rader = skillnad(nu[k], onskat[k]);
  console.log(`\n${k}: ${rader.length} rader skiljer`);
  console.log(rader.slice(0, 40).join('\n'));
  if (rader.length > 40) console.log(`    ... och ${rader.length - 40} till`);
}

if (!skicka) {
  console.log('\nInget skickat. Kör med --skicka för att uppdatera agenten.');
  process.exit(0);
}

const backup = join(rot, 'data/agent-backup');
await mkdir(backup, { recursive: true });
await writeFile(join(backup, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`), JSON.stringify(agent, null, 2));

// Hela prompt-objektet skickas, så att modell, temperatur och verktyg inte nollställs.
const prompt = structuredClone(agent.conversation_config.agent.prompt);
prompt.prompt = onskat.systemprompt;
// End call finns både i built_in_tools och i tools. Den i tools vinner, så båda sätts.
const endCall = {
  ...(prompt.built_in_tools?.end_call ?? { type: 'system', name: 'end_call', params: { system_tool_type: 'end_call' } }),
  description: onskat.end_call,
};
prompt.built_in_tools = { ...prompt.built_in_tools, end_call: endCall };
prompt.tools = (prompt.tools ?? []).map((t) => (t.name === 'end_call' ? { ...t, description: onskat.end_call } : t));
// Kriterierna skickas som hel lista. Befintliga behåller sina övriga fält.
const befintliga = Object.fromEntries((agent.platform_settings.evaluation?.criteria ?? []).map((k) => [k.id, k]));
const criteria = onskat.utvardering.split('\n').map((rad) => {
  const [namn, ...text] = rad.split(': ');
  return { ...(befintliga[namn] ?? { type: 'prompt', use_knowledge_base: false }), id: namn, name: namn, conversation_goal_prompt: text.join(': ') };
});

const res = await fetch(url, {
  method: 'PATCH',
  headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_config: { agent: { prompt, first_message: onskat.forsta } },
    platform_settings: { evaluation: { ...agent.platform_settings.evaluation, criteria } },
  }),
});
console.log(res.ok ? `\nAgenten uppdaterad: ${andrade.join(', ')}.` : `\nFel ${res.status}: ${await res.text()}`);
