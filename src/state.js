import {
  COINS_PER_DIMENSION,
  DIMENSIONS,
  MAX_DIMENSION_SCORE,
  QUESTIONS,
} from './data/gameData.js';

export const state = {
  role: null,
  answers: {},
  startedAt: Date.now(),
};

export function recordAnswer(question, optionIndex) {
  const option = question.options[optionIndex];
  state.answers[question.id] = {
    dimension: question.dimension,
    question: question.text,
    answer: option.label,
    score: option.score,
    optionIndex,
    andrad: state.answers[question.id] ? true : undefined,
  };
}

// Svar går att ändra: blocket kommer ihåg vad du valde förra gången.
export function answerFor(questionId) {
  return state.answers[questionId]?.optionIndex ?? null;
}

export function dimensionScores() {
  const scores = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0]));
  for (const answer of Object.values(state.answers)) {
    scores[answer.dimension] += answer.score;
  }
  return scores;
}

export function dimensionFill(dimensionId) {
  return dimensionScores()[dimensionId] / MAX_DIMENSION_SCORE;
}

// Mynt är hur mognaden visas för spelaren: 0-5 per dimension, aldrig en siffra.
export function coinsEarned(dimensionId) {
  return Math.min(
    COINS_PER_DIMENSION,
    Math.round(dimensionFill(dimensionId) * COINS_PER_DIMENSION),
  );
}

export function answeredCount() {
  return Object.keys(state.answers).length;
}

export function isComplete() {
  return answeredCount() >= QUESTIONS.length;
}

// Raw answers only — the interpretation belongs to the human advisor, not the player.
export function submissionPayload(contact) {
  return {
    ...contact,
    roll: state.role?.label ?? 'okänd',
    speltid_sekunder: Math.round((Date.now() - state.startedAt) / 1000),
    svar: Object.entries(state.answers).map(([id, a]) => ({
      id,
      dimension: a.dimension,
      fraga: a.question,
      svar: a.answer,
      poang: a.score,
    })),
    dimensionspoang: dimensionScores(),
  };
}
