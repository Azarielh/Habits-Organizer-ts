import {
	calculateCurrentStreak,
	calculateLongestStreak,
	getCompletionsForCurrentPeriod,
	getCompletionsThisWeek,
	getCompletionsToday,
	getCompletionThisMonth,
	getExpectedCompletionsThisWeek,
	getGlobalCompletionRate,
	getHabitDateForLog,
	getWeightedGlobalCompletionRate,
} from "../../habits";
import type { Habit, Status } from "./type";

const statuses = new Set<Status>(["completed", "skipped", "missed", "not_applicable", "toupdate"]);

export type HabitLogFilters = {
	habitName?: string;
	from?: string;
	to?: string;
	status?: string;
	limit?: number;
	offset?: number;
};

export function filterHabitLogs(habits: Habit[], filters: HabitLogFilters) {
	const logs = habits.flatMap((habit) => (habit.completedLogs ?? []).map((log) => ({ ...log, habitName: habit.name })));
	const filtered = logs.filter((log) => {
		const date = getHabitDateForLog(log);
		return (!filters.habitName || log.habitName === filters.habitName)
			&& (!filters.status || log.status === filters.status)
			&& (!filters.from || date !== undefined && date >= filters.from)
			&& (!filters.to || date !== undefined && date <= filters.to);
	});
	const offset = filters.offset ?? 0;
	const page = filters.limit === undefined ? filtered.slice(offset) : filtered.slice(offset, offset + filters.limit);
	return { total: filtered.length, offset, limit: filters.limit ?? null, logs: page };
}

export function validateHabitLogFilters(params: URLSearchParams): { filters?: HabitLogFilters; error?: string } {
	const from = params.get("from") ?? undefined;
	const to = params.get("to") ?? undefined;
	const status = params.get("status") ?? undefined;
	const limitValue = params.get("limit");
	const offsetValue = params.get("offset");
	const datePattern = /^\d{4}-\d{2}-\d{2}$/;
	const isValidDate = (value: string) => {
		if (!datePattern.test(value)) return false;
		const [year, month, day] = value.split("-").map(Number);
		const parsed = new Date(year!, month! - 1, day!);
		return parsed.getFullYear() === year && parsed.getMonth() === month! - 1 && parsed.getDate() === day;
	};
	if (from && !isValidDate(from) || to && !isValidDate(to)) return { error: "from and to must be dates in YYYY-MM-DD format" };
	if (from && to && from > to) return { error: "from must be earlier than or equal to to" };
	if (status && !statuses.has(status as Status)) return { error: "status must be completed, skipped, missed, not_applicable, or toupdate" };

	const limit = limitValue === null ? undefined : Number(limitValue);
	const offset = offsetValue === null ? undefined : Number(offsetValue);
	if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) return { error: "limit must be an integer between 1 and 1000" };
	if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) return { error: "offset must be a non-negative integer" };
	return { filters: { from, to, status, limit, offset } };
}

export function getHabitStatistics(habit: Habit) {
	return {
		completionsToday: getCompletionsToday(habit),
		completionsThisWeek: getCompletionsThisWeek(habit),
		completionsThisMonth: getCompletionThisMonth(habit),
		completionsCurrentPeriod: getCompletionsForCurrentPeriod(habit),
		expectedCompletionsThisWeek: getExpectedCompletionsThisWeek(habit),
		completionRateGlobal: getGlobalCompletionRate(habit),
		currentStreak: calculateCurrentStreak(habit),
		longestStreak: calculateLongestStreak(habit),
		totalCompletions: (habit.completedLogs ?? []).filter((log) => log.status === "completed").length,
		logCount: (habit.completedLogs ?? []).length,
	};
}

export function getAllHabitStatistics(habits: Habit[]) {
	return {
		totalHabits: habits.length,
		totalLogs: habits.reduce((total, habit) => total + (habit.completedLogs ?? []).length, 0),
		totalCompletions: habits.reduce((total, habit) => total + (habit.completedLogs ?? []).filter((log) => log.status === "completed").length, 0),
		completionRateGlobal: getWeightedGlobalCompletionRate(habits),
		habits: habits.map((habit) => ({ name: habit.name, ...getHabitStatistics(habit) })),
	};
}

