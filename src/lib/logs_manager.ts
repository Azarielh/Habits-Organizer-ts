import type { Habit, ToggleHabit } from "./type";
import { calculateCurrentStreak, calculateLongestStreak, getHabitDateForLog, getHabitPeriodKey } from "../../habits";

export async function handleToggleHabit(payload: ToggleHabit, currentHabits: Habit[]): Promise<Habit[]> {
	const matchingHabits = currentHabits.filter((habit) => habit.name === payload.name);
	if (matchingHabits.length !== 1) throw new Error("Habit not found or name is ambiguous");
	const iterationCount = Math.max(1, matchingHabits[0]!.iteration || 1);
	if (payload.iterationIndex >= iterationCount) throw new Error("Invalid repetition index");

	return currentHabits.map((habit) => {
		if (habit.name !== payload.name) return habit;

		const allLogs = habit.completedLogs ?? [];
		const todayLogs = allLogs.filter((log) => {
			if (log.status !== "completed") return false;
			const logDate = getHabitDateForLog(log);
			return logDate !== undefined && (log.periodKey ?? getHabitPeriodKey(habit, logDate)) === payload.periodKey;
		});
		const slots = new Map<number, (typeof todayLogs)[number]>();
		for (const log of todayLogs) {
			if (Number.isInteger(log.iterationIndex) && log.iterationIndex! < iterationCount && !slots.has(log.iterationIndex!)) {
				slots.set(log.iterationIndex!, log);
			}
		}
		let nextSlot = 0;
		for (const log of todayLogs) {
			if (Number.isInteger(log.iterationIndex)) continue;
			while (slots.has(nextSlot)) nextSlot++;
			if (nextSlot < iterationCount) slots.set(nextSlot++, log);
		}

		if (payload.iterationIndex < iterationCount) {
			if (payload.isChecked && !slots.has(payload.iterationIndex)) {
				slots.set(payload.iterationIndex, {
					status: "completed", completedAt: new Date().toISOString(),
					habitDate: payload.habitDate, periodKey: payload.periodKey, iterationIndex: payload.iterationIndex,
				});
			} else if (!payload.isChecked) {
				slots.delete(payload.iterationIndex);
			}
		}
		const todayLogSet = new Set(todayLogs);
		const completedLogs = [
			...allLogs.filter((log) => !todayLogSet.has(log)),
			...Array.from(slots.entries()).sort(([a], [b]) => a - b).map(([index, log]) => ({
				...log,
				habitDate: log.habitDate ?? getHabitDateForLog(log) ?? payload.habitDate,
				periodKey: payload.periodKey,
				iterationIndex: index,
			})),
		];

		const updated: Habit = { ...habit, completedLogs };
		updated.currentStreak = calculateCurrentStreak(updated, payload.habitDate);
		updated.longestStreak = calculateLongestStreak(updated);
		updated.totalCompleted = completedLogs.filter((log) => log.status === "completed").length;
		return updated;
	});
}
