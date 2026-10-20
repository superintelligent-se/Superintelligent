#!/usr/bin/env node
// Jämför agentens inställningar i ElevenLabs med KONFIGURATION.md och texterna i agent/.
//
//   node rostagent/scripts/kontrollera-agent.mjs
//
// Läser bara. Kör efter varje ändring i ElevenLabs, och innan en kund får länken.
// Fältnamnen följer ElevenLabs agent-API. Saknas ett fält skrivs "?" i stället
// för att gissa — då är det gränssnittet som gäller.

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { agent_id: agentId } = JSON.parse(await readFile(join(rot, 'config.json'), 'utf8'));

let apiKey = process.env.ELEVENLABS_API_KEY;
try {
  apiKey ??= execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api', '-w'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {}
if (!apiKey) {
  console.error('Ingen API-nyckel. Lägg den i nyckelringen: security add-generic-password -a "$USER" -s elevenlabs-api -w');
  process.exit(1);
}

const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, { headers: { 'xi-api-key': apiKey } });
if (!res.ok) {
  console.error(`${res.status} ${res.statusText}: ${await res.text()}`);
  process.exit(1);
}
const agent = await res.json();

const hamta = (sokvag) => sokvag.split('.').reduce((o, k) => (o == null ? undefined : o[k]), agent);
const efterStreck = async (fil) => (await readFile(join(rot, fil), 'utf8')).split('\n---\n')[1]?.trim() ?? '';
const normalisera = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

let fel = 0;
function kolla(namn, varde, ok, onskat) {
  if (varde === undefined) {
    console.log(`  ?  ${namn}: kunde inte läsas, kontrollera i gränssnittet (ska vara ${onskat})`);
    return;
  }
  const bra = ok(varde);
  if (!bra) fel++;
  const visat = typeof varde === 'object' ? JSON.stringify(varde) : String(varde);
  console.log(`  ${bra ? '✓' : '✗'}  ${namn}: ${visat.length > 80 ? `${visat.slice(0, 77)}...` : visat}${bra ? '' : `  ← ska vara ${onskat}`}`);
}

console.log(`\n${agent.name ?? agentId}\n\nAgent`);
kolla('Språk', hamta('conversation_config.agent.language'), (v) => v === 'sv', 'sv');
const forsta = (await efterStreck('agent/forsta-meddelande.md')).split('\n\n')[0];
const systemprompt = await efterStreck('agent/systemprompt.md');
kolla('Första meddelandet', hamta('conversation_config.agent.first_message'), (v) => normalisera(v) === normalisera(forsta), 'texten i agent/forsta-meddelande.md');
kolla('Systemprompt', hamta('conversation_config.agent.prompt.prompt'), (v) => normalisera(v) === normalisera(systemprompt), 'texten i agent/systemprompt.md');
kolla('LLM', hamta('conversation_config.agent.prompt.llm'), (v) => /gpt-6-luna/i.test(v), 'gpt-6-luna');
kolla('Temperatur', hamta('conversation_config.agent.prompt.temperature'), (v) => v <= 0.4, '0,3');
const platshallare = hamta('conversation_config.agent.dynamic_variables.dynamic_variable_placeholders');
kolla('Dynamiska variabler', platshallare && Object.keys(platshallare), (v) => v.length === 0, 'inga');
const verktyg = [
  ...(hamta('conversation_config.agent.prompt.tools') ?? []),
  ...Object.keys(hamta('conversation_config.agent.prompt.built_in_tools') ?? {}).filter((k) => hamta(`conversation_config.agent.prompt.built_in_tools.${k}`)),
].map((t) => (typeof t === 'string' ? t : t.name));
kolla('Verktyg', verktyg, (v) => v.includes('end_call') && !v.some((n) => ['transfer_to_number', 'transfer_to_agent', 'language_detection', 'skip_turn'].includes(n)), 'bara end_call');

console.log('\nRöst');
kolla('TTS-modell', hamta('conversation_config.tts.model_id'), (v) => /v4|v2_5|turbo/.test(v), 'eleven_v4_turbo eller turbo v2.5');
kolla('Expressive mode', hamta('conversation_config.tts.expressive_mode'), (v) => v === false, 'av (AI-förordningen art. 5.1 f)');
kolla('Stability', hamta('conversation_config.tts.stability'), (v) => v >= 0.4 && v <= 0.6, '0,50');
kolla('Similarity', hamta('conversation_config.tts.similarity_boost'), (v) => v >= 0.7, '0,80');

console.log('\nSamtal');
kolla('Max längd (s)', hamta('conversation_config.conversation.max_duration_seconds'), (v) => v >= 1500, '1800');
kolla('Turn timeout (s)', hamta('conversation_config.turn.turn_timeout'), (v) => v >= 15, '20');
kolla('Turn eagerness', hamta('conversation_config.turn.turn_eagerness'), (v) => v === 'patient', 'patient');

console.log('\nIntegritet och säkerhet');
const privacy = hamta('platform_settings.privacy') ?? {};
kolla('Utskrift, dagar', privacy.retention_days ?? privacy.conversation_retention_days, (v) => v > 0 && v <= 60, '60');
kolla('Ljud, dagar', privacy.audio_retention_days, (v) => v > 0 && v <= 30, '30');
kolla('Zero retention', privacy.zero_retention_mode, (v) => v === false, 'av');
kolla('Autentisering', hamta('platform_settings.auth.enable_auth'), (v) => v === false, 'av, annars fungerar inte den öppna länken');
const overrides = JSON.stringify(hamta('platform_settings.overrides') ?? null);
kolla('Overrides', hamta('platform_settings.overrides') && overrides, (v) => !/true/.test(v), 'allt av');
kolla('Dagligt samtalstak', hamta('platform_settings.call_limits.daily_limit'), (v) => v > 0 && v <= 500, 't.ex. 100');

console.log('\nAnalys');
const onskadeFalt = [...(await readFile(join(rot, 'agent/datainsamling.md'), 'utf8')).matchAll(/^\| \d+ \| `([a-z_]+)` \|/gm)].map((m) => m[1]);
const faltIAgent = Object.keys(hamta('platform_settings.data_collection') ?? {});
const saknas = onskadeFalt.filter((f) => !faltIAgent.includes(f));
const extra = faltIAgent.filter((f) => !onskadeFalt.includes(f));
kolla('Datainsamling', faltIAgent.length ? `${faltIAgent.length} fält` : undefined, () => !saknas.length && !extra.length, `de ${onskadeFalt.length} i agent/datainsamling.md`);
if (saknas.length) console.log(`       saknas: ${saknas.join(', ')}`);
if (extra.length) console.log(`       finns men ska inte: ${extra.join(', ')}`);
const onskadeKriterier = [...(await readFile(join(rot, 'agent/utvardering.md'), 'utf8')).matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]);
const kriterier = (hamta('platform_settings.evaluation.criteria') ?? []).map((k) => k.name ?? k.id);
const saknadeKriterier = onskadeKriterier.filter((k) => !kriterier.includes(k));
kolla('Utvärdering', kriterier.length ? `${kriterier.length} kriterier` : undefined, () => !saknadeKriterier.length, onskadeKriterier.join(', '));
if (saknadeKriterier.length) console.log(`       saknas: ${saknadeKriterier.join(', ')}`);

console.log(fel ? `\n${fel} avvikelse(r).` : '\nInga avvikelser bland det som gick att läsa.');

