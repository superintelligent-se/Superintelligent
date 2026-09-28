// Bygger public/lead-mail.json ur gameData.js. Power Automate-flödet hämtar
// filen och sätter ihop bekräftelsemejlet till besökaren av färdiga bitar.
//
// Varför bitar och inte ett mejl från webbläsaren: formuläret är öppet för
// alla. Skickade spelet färdig mejltext skulle vem som helst kunna få
// support@ att mejla valfritt innehåll till valfri adress. Nu väljer
// besökaren bara bland våra egna texter via index — det enda fria är namnet,
// och det tvättar flödet.
//
// Mejlet återger bara det spelaren redan sett: mynten, utrustningen och
// kommentaren efter varje svar. Ingen nivå, ingen totalpoäng, inga råd.
import { writeFileSync, mkdirSync } from 'node:fs';
import {
  COINS_PER_DIMENSION,
  DIMENSIONS,
  GEAR_THRESHOLD,
  questionsFor,
} from '../src/data/gameData.js';
import { BOOKING_URL } from '../src/config.js';

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONT = "font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;";

// Mynten ritas som i HUD:en: fyllda i dimensionens färg, tomma i grått.
function coinsHtml(dimension, coins) {
  const filled = `<span style="color:${dimension.color};font-size:20px;">&#9679;</span>`;
  const empty = '<span style="color:#d0d0d0;font-size:20px;">&#9679;</span>';
  const row = filled.repeat(coins) + empty.repeat(COINS_PER_DIMENSION - coins);
  const gear =
    coins >= GEAR_THRESHOLD
      ? `<div style="${FONT}font-size:13px;color:#333;margin-top:4px;"><strong>${esc(dimension.gearLabel)}</strong><br>${esc(dimension.gearWhy)}</div>`
      : `<div style="${FONT}font-size:13px;color:#888;margin-top:4px;">Ingen utrustning i den här zonen — du sprang vidare utan.</div>`;
  return (
    `<tr><td style="padding:22px 0 6px;border-top:3px solid ${dimension.color};">` +
    `<div style="${FONT}font-size:17px;font-weight:bold;color:#111;">${esc(dimension.label)}</div>` +
    `<div style="${FONT}font-size:13px;color:#666;font-style:italic;margin-bottom:6px;">${esc(dimension.tagline)}</div>` +
    `<div>${row}</div>${gear}</td></tr>`
  );
}

function answerHtml(question, option) {
  return (
    `<tr><td style="padding:10px 0 0 12px;border-left:2px solid #eee;${FONT}font-size:14px;color:#222;">` +
    `<div style="color:#666;font-size:12px;">${esc(question.text)}</div>` +
    `<div style="font-weight:bold;margin:2px 0;">${esc(option.label)}</div>` +
    `<div style="color:#444;">${esc(option.comment)}</div></td></tr>`
  );
}

const cta =
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr>` +
  `<td style="background:#2e9e63;border-radius:6px;"><a href="${BOOKING_URL}" ` +
  `style="display:inline-block;padding:14px 26px;${FONT}font-size:16px;font-weight:bold;color:#fff;text-decoration:none;">` +
  `Boka 30 minuter kostnadsfritt</a></td></tr></table>`;

const shell = (inner) =>
  `<!doctype html><html lang="sv"><body style="margin:0;background:#f4f4f4;">` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;"><tr><td align="center" style="padding:24px 12px;">` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;"><tr><td style="padding:28px 28px 24px;">` +
  inner +
  `<p style="${FONT}font-size:12px;color:#999;margin-top:28px;">Superintelligent Group AB · ` +
  `<a href="mailto:hello@superintelligent.se" style="color:#999;">hello@superintelligent.se</a><br>` +
  `Du får det här mejlet för att du skickade in dina svar i The Superintelligent Game.</p>` +
  `</td></tr></table></td></tr></table></body></html>`;

const p = (text, extra = '') =>
  `<p style="${FONT}font-size:15px;line-height:1.5;color:#222;${extra}">${text}</p>`;

// Topp och botten på det vanliga mejlet. {{namn}} ersätts av flödet med
// det tvättade förnamnet.
const top =
  p('Hej {{namn}},') +
  p('Tack för att du spelade The Superintelligent Game. Här är din bana i efterhand — mynten du samlade, utrustningen du fick med dig och vad vi sa om varje svar längs vägen.') +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">';

const bottom =
  '</table>' +
  p('Det här är vad du såg på banan, svar för svar. Vad det betyder tillsammans — var ni står, vad som hänger ihop och vad som ger mest effekt först — är något vi går igenom med dig.', 'margin-top:28px;') +
  p('Har du redan bokat ett möte ses vi snart. Annars är nästa steg här:') +
  cta;

const shortcut =
  p('Hej {{namn}},') +
  p('Du tog röret och hoppade rakt till slutet. Det säger egentligen det vi behöver veta för ett första samtal: ni vill komma igång, inte kartlägga.') +
  p('Frågorna du hoppade över tar vi när vi ses — det går fortare att prata om dem än att svara på dem ensam.') +
  p('Har du redan bokat ett möte ses vi snart. Annars är nästa steg här:') +
  cta;

// Rader i bankordning. Flödet går igenom dem en i taget: en dimensionsrad
// väljer HTML efter antal mynt, en frågerad efter svarets index. Saknas ett
// svar blir raden tom.
const rows = DIMENSIONS.flatMap((dimension) => [
  {
    typ: 'dimension',
    id: dimension.id,
    html: Array.from({ length: COINS_PER_DIMENSION + 1 }, (_, coins) => coinsHtml(dimension, coins)),
  },
  ...questionsFor(dimension.id).map((question) => ({
    typ: 'fraga',
    id: question.id,
    html: question.options.map((option) => answerHtml(question, option)),
  })),
]);

const [before, after] = shell('§').split('§');

const data = {
  amne: 'Din bana i The Superintelligent Game',
  fore: before + top,
  rader: rows,
  efter: bottom + after,
  genvag: shell(shortcut),
};

mkdirSync('public', { recursive: true });
writeFileSync('public/lead-mail.json', JSON.stringify(data));
console.log(`public/lead-mail.json: ${rows.length} rader`);
