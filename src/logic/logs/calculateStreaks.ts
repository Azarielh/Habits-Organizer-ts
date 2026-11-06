import type { Habit } from "../../lib/type";
import { calculateCurrentStreak } from "../../../habits";

/**
 * Recalcule les statistiques de streak pour un habit
 */
export function calculateAndUpdateStreaks(habit: Habit): Habit {
  const currentStreak = calculateCurrentStreak(habit);
  
  // Compter le total des logs "completed"
  const totalCompleted = (habit.completedLogs || []).filter(
    log => log.status === "completed" && log.completedAt
  ).length;

  return {
    ...habit,
    currentStreak,
    totalCompleted
  };
}
