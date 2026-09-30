#!/usr/bin/env node
// Skriver ut en intervjulänk per roll för en kund.
//
//   node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>"
//
// Länken är densamma för alla i en roll och innehåller inget namn —
// det är det som gör att svaren kan redovisas per roll och inte per person.

const [agentId, kundId, foretag] = process.argv.slice(2);

if (!agentId || !kundId || !foretag) {
  console.error('Användning: node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>"');
  process.exit(1);
}

// kund_id hamnar i en URL och som mappnamn under data/.
if (!/^[a-z0-9-]+$/.test(kundId)) {
  console.error('kund_id får bara innehålla a–z, 0–9 och bindestreck, t.ex. sf-lund-2026-10');
  process.exit(1);
}

const ROLLER = [
  ['agare', 'Ägare / Franchiseägare / VD'],
  ['chef', 'Kontorschef / Teamledare'],
  ['maklare', 'Mäklare'],
  ['saljstod', 'Säljstöd / Koordinator / Assistent'],
  ['annan', 'Annan roll'],
];

console.log(`\n${foretag} (${kundId})\n`);
for (const [roll, namn] of ROLLER) {
  const url = new URL('https://elevenlabs.io/app/talk-to');
  url.searchParams.set('agent_id', agentId);
  url.searchParams.set('var_foretag', foretag);
  url.searchParams.set('var_roll', roll);
  url.searchParams.set('var_kund_id', kundId);
  // %20 i stället för + — alla tolkar inte + som mellanslag i en query.
  console.log(`${namn}\n${url.href.replaceAll('+', '%20')}\n`);
}
