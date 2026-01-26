import type { Habit, ToggleHabit } from "./type";
import { toggleLogForToday } from "../logic/logs/toggleLogForToday";
import { updateCompletedLogs } from "../logic/logs/updateCompletedLogs";
import { calculateAndUpdateStreaks } from "../logic/logs/calculateStreaks";

export async function handleToggleHabit(
  payload: ToggleHabit,
  currentHabits: Habit[]
): Promise<Habit[]> {
  return currentHabits.map((habit) => {
    if (habit.name === payload.name) {
      // 1. Toggle les logs du jour basé sur l'état du checkbox
      const toggledLogs = toggleLogForToday(payload.completedLogs, payload.isChecked);
      
      // 2. Mettre à jour les completedLogs
      let updatedHabit = updateCompletedLogs(habit, toggledLogs);
      
      // 3. Recalculer les streaks
      updatedHabit = calculateAndUpdateStreaks(updatedHabit);
      
      return updatedHabit;
    }
    return habit;
  });
}
