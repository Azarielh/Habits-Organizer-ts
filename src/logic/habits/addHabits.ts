import type { Habit, AddHabit } from "../../lib/type.ts";

export function addHabits(payload: AddHabit, currentHabits: Habit[]): Habit[] {
	if (currentHabits.some((habit) => habit.name.trim().toLocaleLowerCase() === payload.name.trim().toLocaleLowerCase())) {
		throw new Error("Une habitude porte déjà ce nom.");
	}

  const newHabit: Habit = {
    name: payload.name.trim(),
    frequency: payload.frequency,
    iteration: Math.max(1, Math.floor(payload.iteration)),
    time: payload.time,
    description: payload.description,
    completedLogs: [],
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
  };
  return [...currentHabits, newHabit];
}
