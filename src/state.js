import { DIMENSIONS, QUESTIONS, MAX_DIMENSION_SCORE } from './data/gameData.js';

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
  };
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
