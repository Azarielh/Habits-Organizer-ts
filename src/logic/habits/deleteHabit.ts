import type { DeleteHabit, Habit } from "../../lib/type";

/**
 * Supprime un habit par son nom
 */
export function deleteHabit(habitName: DeleteHabit, habits: Habit[]): Habit[] {
  return habits.filter(h => h.name !== habitName.name);
}
