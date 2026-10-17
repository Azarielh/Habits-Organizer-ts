import { describe, expect, test } from "bun:test";
import {
	calculateCurrentStreak,
	calculateLongestStreak,
	getGlobalCompletionRate,
} from "../../habits";
import type { Habit } from "./type";

const weeklyHabit = (completedDates: string[]): Habit => ({
	name: "Lecture",
	frequency: "semaine",
	iteration: 1,
	time: "",
	createdAt: "2026-10-01T12:00:00.000Z",
	completedLogs: completedDates.map((habitDate) => ({ status: "completed", habitDate })),
});

describe("habit statistics", () => {
	test("counts the current and longest streak across consecutive weekly periods", () => {
		const habit = weeklyHabit(["2026-10-09", "2026-10-16"]);

		expect(calculateCurrentStreak(habit, "2026-10-17")).toBe(2);
		expect(calculateLongestStreak(habit)).toBe(2);
	});

	test("falls back to the previous completed period when the current one is incomplete", () => {
		expect(calculateCurrentStreak(weeklyHabit(["2026-10-09"]), "2026-10-17")).toBe(1);
	});

	test("does not report a global completion rate above 100 percent", () => {
		const habit: Habit = {
			name: "Hydratation",
			frequency: "daily",
			iteration: 1,
			time: "",
			createdAt: "2026-10-16T12:00:00.000Z",
			completedLogs: Array.from({ length: 3 }, () => ({ status: "completed", habitDate: "2026-10-16" })),
		};

		expect(getGlobalCompletionRate(habit)).toBe(100);
	});
});
