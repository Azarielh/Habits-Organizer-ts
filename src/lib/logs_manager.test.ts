import { describe, expect, test } from "bun:test";
import { handleToggleHabit } from "./logs_manager";
import { getCompletedIterationIndexes, getCompletionsForCurrentPeriod, getHabitPeriodKey } from "../../habits";
import { formatLocalDate, getHabitDateForDate } from "./get_4to4_gliding_day";
import type { Habit } from "./type";

const date = "2026-10-17";

function sampleHabit(completedLogs: Habit["completedLogs"] = []): Habit {
	return {
		name: "Lecture",
		frequency: "daily",
		iteration: 2,
		time: "",
		createdAt: "2026-10-01T12:00:00.000Z",
		completedLogs,
	};
}

describe("handleToggleHabit", () => {
	test("uses the local 04:00 boundary without converting the date to UTC", () => {
		const beforeFour = new Date(2026, 9, 17, 3, 59);
		const afterFour = new Date(2026, 9, 17, 4, 0);

		expect(getHabitDateForDate(beforeFour)).toBe("2026-10-16");
		expect(getHabitDateForDate(afterFour)).toBe(formatLocalDate(afterFour));
	});

	test("checks one repetition without duplicating it when the request is repeated", async () => {
		const habit = sampleHabit();
		const payload = { name: habit.name, habitDate: date, periodKey: date, iterationIndex: 1, isChecked: true };
		const once = await handleToggleHabit(payload, [habit]);
		const twice = await handleToggleHabit(payload, once);

		expect(twice[0]?.completedLogs).toHaveLength(1);
		expect(twice[0]?.completedLogs[0]).toMatchObject({ status: "completed", habitDate: date, iterationIndex: 1 });
		expect(twice[0]?.totalCompleted).toBe(1);
	});

	test("unchecks only the selected repetition and preserves missed and older logs", async () => {
		const habit = sampleHabit([
			{ status: "completed", habitDate: date, iterationIndex: 0, completedAt: `${date}T09:00:00.000Z` },
			{ status: "completed", habitDate: date, iterationIndex: 1, completedAt: `${date}T10:00:00.000Z` },
			{ status: "completed", habitDate: "2026-10-16", iterationIndex: 0, completedAt: "2026-10-16T09:00:00.000Z" },
			{ status: "missed", habitDate: date, constraints: "fatigue" },
		]);

		const [updated] = await handleToggleHabit({ name: habit.name, habitDate: date, periodKey: date, iterationIndex: 0, isChecked: false }, [habit]);

		expect(updated?.completedLogs).toHaveLength(3);
		expect(updated?.completedLogs?.some((log) => log.status === "completed" && log.habitDate === date && log.iterationIndex === 1)).toBe(true);
		expect(updated?.completedLogs?.some((log) => log.status === "missed" && log.constraints === "fatigue")).toBe(true);
		expect(updated?.totalCompleted).toBe(2);
	});

	test("assigns legacy same-day completions to repetition slots before updating", async () => {
		const habit = sampleHabit([
			{ status: "completed", completedAt: `${date}T09:00:00.000Z` },
			{ status: "completed", completedAt: `${date}T10:00:00.000Z` },
		]);

		const [updated] = await handleToggleHabit({ name: habit.name, habitDate: date, periodKey: date, iterationIndex: 0, isChecked: false }, [habit]);

		expect(updated?.completedLogs).toHaveLength(1);
		expect(updated?.completedLogs?.[0]).toMatchObject({ status: "completed", habitDate: date, iterationIndex: 1 });
	});

	test("keeps weekly repetition checkboxes attached to the week across different dates", async () => {
		const weeklyHabit: Habit = { ...sampleHabit(), frequency: "semaine", createdAt: "2026-10-01T12:00:00.000Z" };
		const monday = "2026-10-12";
		const periodKey = getHabitPeriodKey(weeklyHabit, date);
		const [first] = await handleToggleHabit({ name: weeklyHabit.name, habitDate: "2026-10-16", periodKey, iterationIndex: 0, isChecked: true }, [weeklyHabit]);
		const [second] = await handleToggleHabit({ name: weeklyHabit.name, habitDate: date, periodKey: monday, iterationIndex: 1, isChecked: true }, [first!]);

		expect(periodKey).toBe(monday);
		expect(getCompletionsForCurrentPeriod(second!, date)).toBe(2);
		expect(getCompletedIterationIndexes(second!, monday)).toEqual(new Set([0, 1]));
	});
});
