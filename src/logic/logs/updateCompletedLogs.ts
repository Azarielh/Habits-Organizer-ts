import type { Habit, CompletedLog } from "../../lib/type";

/**
 * Met à jour les completedLogs d'un habit
 */
export function updateCompletedLogs(habit: Habit, newLogs: CompletedLog[]): Habit {
  return {
    ...habit,
    completedLogs: newLogs
  };
}
