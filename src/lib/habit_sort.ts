import type { Habit } from "./type";

function getHabitFrequencyRank(habit: Habit): number {
	if (habit.frequency === "daily" || typeof habit.frequency === "object") return 0;
	if (habit.frequency === "weekend") return 2;
	const ranks: Record<string, number> = { semaine: 3, quinzaine: 4, mois: 5, semestre: 6, an: 7 };
	return ranks[habit.frequency] ?? 8;
}

/** Shared display ordering for the home and all-habits pages. */
export function sortHabitsForDisplay(habits: Habit[]): Habit[] {
	return habits
		.map((habit, index) => ({ habit, index }))
		.sort((a, b) => getHabitFrequencyRank(a.habit) - getHabitFrequencyRank(b.habit)
			|| (getHabitFrequencyRank(a.habit) === 0 && getHabitFrequencyRank(b.habit) === 0
				? (["morning", "afternoon", "evening", ""] as const).indexOf(a.habit.time) - (["morning", "afternoon", "evening", ""] as const).indexOf(b.habit.time)
				: 0)
			|| a.index - b.index)
		.map(({ habit }) => habit);
}
