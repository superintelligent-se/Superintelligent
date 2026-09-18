import {
  COINS_PER_DIMENSION,
  DIMENSIONS,
  GEAR_THRESHOLD,
  QUESTIONS,
  SUMMARY_CLOSER,
  summaryForDimension,
  summaryOpener,
} from './data/gameData.js';
import { answeredCount, coinsEarned, state, submissionPayload } from './state.js';

// Två helt skilda vyer av samma spelomgång, och de får aldrig blandas ihop:
//
//   hudSnapshot()   — exakt det spelaren redan såg i HUD:en. Mynt och
//                     utrustning, inget nytt. Går med i mejlet som den är.
//   playerSummary() — en övergripande kommentar per dimension, vald på
//                     antal mynt. Aldrig per fråga, aldrig ett tal, aldrig
//                     ett råd. Detaljerna är rådgivarens att ge i mötet.
//
// Allt annat — varje svar, varje poäng, varje kommentar ur frågefilen —
// finns bara i submissionPayload() och stannar hos rådgivaren.

export function hudSnapshot() {
  return {
    besvarade: answeredCount(),
    av: QUESTIONS.length,
    dimensioner: DIMENSIONS.map((dimension) => {
      const coins = coinsEarned(dimension.id);
      return {
        id: dimension.id,
        namn: dimension.label,
        farg: dimension.color,
        mynt: coins,
        av: COINS_PER_DIMENSION,
        // Samma sträng som står bredvid dimensionen i HUD:en.
        utrustning: dimension.gearLabel,
        utrustning_vunnen: coins >= GEAR_THRESHOLD,
      };
    }),
  };
}

export function totalCoins() {
  return DIMENSIONS.reduce((sum, dimension) => sum + coinsEarned(dimension.id), 0);
}

// Den som tog röret har inga svar, alltså ingen sammanfattning att ge.
// Att hitta på en vore värre än att säga det rakt ut.
export function playerSummary() {
  if (state.shortcut) return null;

  return {
    inledning: summaryOpener(totalCoins()),
    dimensioner: DIMENSIONS.map((dimension) => {
      const coins = coinsEarned(dimension.id);
      return {
        id: dimension.id,
        namn: dimension.label,
        farg: dimension.color,
        mynt: coins,
        av: COINS_PER_DIMENSION,
        utrustning: coins >= GEAR_THRESHOLD ? dimension.gearLabel : null,
        kommentar: summaryForDimension(dimension, coins),
      };
    }),
    avslutning: SUMMARY_CLOSER,
  };
}

// Hela leadet i ett stycke: rådgivarens råmaterial plus de två spelarvyerna.
// Flödet i Power Automate läser `svar` och `dimensionspoang` till listan, och
// `hud` och `sammanfattning` till mejlet. Ingenting under `sammanfattning`
// får någonsin innehålla en enskild frågas kommentar.
export function leadPayload(contact) {
  return {
    ...submissionPayload(contact),
    hud: hudSnapshot(),
    sammanfattning: playerSummary(),
  };
}
