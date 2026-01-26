import type { Habit, AddHabit } from "../../lib/type.ts";

export function addHabits(payload: AddHabit, currentHabits: Habit[]): Habit[] {
  const newHabit: Habit = {
    name: payload.name,
    frequency: payload.frequency,
    iteration: payload.iteration,
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
