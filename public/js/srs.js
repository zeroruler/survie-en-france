// ══════════════════════════════════════════════
//   srs.js — SM-2 알고리즘 (Spaced Repetition)
//   참고: SuperMemo SM-2 algorithm
// ══════════════════════════════════════════════

/**
 * 카드 평가 등급 (q)
 *  5 = 완벽 기억
 *  4 = 약간 주저했지만 정답
 *  3 = 겨우 기억
 *  2 = 틀렸지만 정답 보고 쉽게 기억
 *  1 = 틀림 (어렵게 기억)
 *  0 = 완전 망각
 */

export function calculateNextReview(card, quality) {
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = card;

  if (quality >= 3) {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval    = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor:  parseFloat(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReview,
    status: getStatus(repetitions, interval),
  };
}

function getStatus(repetitions, interval) {
  if (repetitions === 0)  return "new";
  if (interval <= 1)      return "learning";
  if (interval <= 7)      return "review";
  return "mastered";
}

export function isDue(card) {
  if (!card.nextReview) return true;
  const next = card.nextReview?.toMillis
    ? card.nextReview.toMillis()
    : new Date(card.nextReview).getTime();
  return next <= Date.now();
}
