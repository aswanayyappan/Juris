/**
 * Score Service
 * Calculates the Legal Health Score (0–100) based on task statuses.
 * Formula: +20 per Done, -20 per Overdue, -10 per Due Soon. Clamped 0–100.
 */

const calculateScore = (tasks) => {
  const applicable = tasks.filter((t) => t.isApplicable);

  let score = 0;
  applicable.forEach((task) => {
    if (task.status === 'done')      score += 20;
    if (task.status === 'overdue')   score -= 20;
    if (task.status === 'due_soon')  score -= 10;
  });

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  const label =
    score >= 80 ? 'safe' :
    score >= 50 ? 'attention' : 'risk';

  return { score, label };
};

module.exports = { calculateScore };
