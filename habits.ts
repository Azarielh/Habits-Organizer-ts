import type { CompletedLog, Frequency, Habit } from "./src/lib/type";
import { formatLocalDate, get_4to4_gliding_day, getHabitDateForDate } from "./src/lib/get_4to4_gliding_day";

export type { Habit } from "./src/lib/type";

const isCompleted = (log: CompletedLog) => log.status === "completed";

export function getHabitDateForLog(log: CompletedLog): string | undefined {
	if (log.habitDate) return log.habitDate;
	return log.completedAt ? getHabitDateForDate(new Date(log.completedAt)) : undefined;
}

export function getHabitPeriodKey(habit: Habit, dateKey: string): string {
	if (typeof habit.frequency !== "string" || ["daily", "weekend"].includes(habit.frequency)) return dateKey;
	const date = new Date(`${dateKey}T12:00:00`);
	if (habit.frequency === "semaine") date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
	else if (habit.frequency === "quinzaine") {
		const anchor = getHabitDateForDate(new Date(habit.createdAt ?? `${dateKey}T12:00:00`));
		const anchorDate = new Date(`${anchor}T12:00:00`);
		const elapsedDays = Math.floor((Date.parse(`${dateKey}T12:00:00`) - Date.parse(`${anchor}T12:00:00`)) / 86_400_000);
		date.setTime(anchorDate.getTime());
		date.setDate(date.getDate() + Math.max(0, Math.floor(elapsedDays / 14)) * 14);
	} else if (habit.frequency === "mois") date.setDate(1);
	else if (habit.frequency === "semestre") date.setMonth(date.getMonth() < 6 ? 0 : 6, 1);
	else if (habit.frequency === "an") date.setMonth(0, 1);
	return formatLocalDate(date);
}

export function getCompletionsForCurrentPeriod(habit: Habit, dateKey = get_4to4_gliding_day()): number {
	const periodKey = getHabitPeriodKey(habit, dateKey);
	return completedInRange(habit, periodKey, dateKey);
}

export function getCompletedIterationIndexes(habit: Habit, periodKey: string): Set<number> {
	const dayLogs = (habit.completedLogs ?? []).filter((log) => {
		if (!isCompleted(log)) return false;
		const day = getHabitDateForLog(log);
		return day !== undefined && (log.periodKey ?? getHabitPeriodKey(habit, day)) === periodKey;
	});
	const completed = new Set<number>();
	for (const log of dayLogs) {
		if (Number.isInteger(log.iterationIndex) && log.iterationIndex! >= 0 && log.iterationIndex! < habit.iteration) {
			completed.add(log.iterationIndex!);
		}
	}
	let nextIndex = 0;
	for (const log of dayLogs) {
		if (Number.isInteger(log.iterationIndex)) continue;
		while (completed.has(nextIndex)) nextIndex++;
		if (nextIndex < habit.iteration) completed.add(nextIndex++);
	}
	return completed;
}

export function getNextIterationIndex(habit: Habit, periodKey: string): number | null {
	const completed = getCompletedIterationIndexes(habit, periodKey);
	const iterationCount = Math.max(1, habit.iteration || 1);
	for (let index = 0; index < iterationCount; index++) {
		if (!completed.has(index)) return index;
	}
	return null;
}

function getDayName(dateKey: string): string {
	return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

function completedOn(habit: Habit, dateKey: string): number {
	return (habit.completedLogs ?? []).filter((log) => isCompleted(log) && getHabitDateForLog(log) === dateKey).length;
}

function completedInRange(habit: Habit, start: string, end: string): number {
	return (habit.completedLogs ?? []).filter((log) => {
		const date = getHabitDateForLog(log);
		return isCompleted(log) && date !== undefined && date >= start && date <= end;
	}).length;
}

export function isHabitForToday(habit: Habit): boolean {
	const today = get_4to4_gliding_day();
	const dayName = getDayName(today);
	const frequency = habit.frequency;
	if (frequency === "daily") return true;
	if (frequency === "weekend") return dayName === "saturday" || dayName === "sunday";
	if (typeof frequency === "object") return frequency.days.includes(dayName as typeof frequency.days[number]);

	return getCompletionsForCurrentPeriod(habit, today) < (habit.iteration || 1);
}

export function isCompletedToday(habit: Habit): boolean {
	return getCompletionsToday(habit) > 0;
}

export function getCompletionsToday(habit: Habit): number {
	return completedOn(habit, get_4to4_gliding_day());
}

export function getCompletionsThisWeek(habit: Habit): number {
	const today = get_4to4_gliding_day();
	const startDate = new Date(`${today}T12:00:00`);
	startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
	return completedInRange(habit, formatLocalDate(startDate), today);
}

export function getCompletionThisMonth(habit: Habit): number {
	const monthStart = new Date(`${get_4to4_gliding_day()}T12:00:00`);
	monthStart.setDate(1);
	return completedInRange(habit, formatLocalDate(monthStart), get_4to4_gliding_day());
}

function expectedPerWeek(frequency: Frequency): number {
	if (typeof frequency === "object") return frequency.days.length;
	switch (frequency) {
		case "daily": return 7;
		case "weekend": return 2;
		case "semaine": return 1;
		case "quinzaine": return 0.5;
		case "mois": return 7 / 30.4375;
		case "semestre": return 7 / 182.625;
		case "an": return 7 / 365.25;
	}
}

export function getExpectedCompletionsThisWeek(habit: Habit): number {
	return expectedPerWeek(habit.frequency) * (habit.iteration || 1);
}

export function getGlobalCompletionRate(habit: Habit): number {
	if (!habit.createdAt) return 0;
	const today = get_4to4_gliding_day();
	const created = getHabitDateForDate(new Date(habit.createdAt));
	if (created > today) return 0;
	const start = created;
	const elapsedDays = Math.max(1, Math.floor((Date.parse(`${today}T12:00:00`) - Date.parse(`${start}T12:00:00`)) / 86_400_000) + 1);
	const expected = elapsedDays * expectedPerWeek(habit.frequency) * (habit.iteration || 1) / 7;
	const actual = (habit.completedLogs ?? []).filter((log) => {
		const date = getHabitDateForLog(log);
		return isCompleted(log) && date !== undefined && date >= start && date <= today;
	}).length;
	return expected === 0 ? 0 : Math.min(100, Math.round(actual / expected * 100));
}

export function getWeightedGlobalCompletionRate(habits: Habit[]): number {
	const eligible = habits.filter((habit) => habit.createdAt);
	const weight = eligible.reduce((sum, habit) => sum + expectedPerWeek(habit.frequency) * (habit.iteration || 1), 0);
	if (!weight) return 0;
	return Math.round(eligible.reduce((sum, habit) => sum + getGlobalCompletionRate(habit) * expectedPerWeek(habit.frequency) * (habit.iteration || 1), 0) / weight);
}

function previousPeriodStart(frequency: string, start: Date): Date {
	const previous = new Date(start);
	if (frequency === "semaine") previous.setDate(previous.getDate() - 7);
	else if (frequency === "quinzaine") previous.setDate(previous.getDate() - 14);
	else if (frequency === "mois") previous.setMonth(previous.getMonth() - 1);
	else if (frequency === "semestre") previous.setMonth(previous.getMonth() - 6);
	else previous.setFullYear(previous.getFullYear() - 1);
	return previous;
}

function nextPeriodStart(frequency: string, start: Date): Date {
	const next = new Date(start);
	if (frequency === "semaine") next.setDate(next.getDate() + 7);
	else if (frequency === "quinzaine") next.setDate(next.getDate() + 14);
	else if (frequency === "mois") next.setMonth(next.getMonth() + 1);
	else if (frequency === "semestre") next.setMonth(next.getMonth() + 6);
	else next.setFullYear(next.getFullYear() + 1);
	return next;
}

function dayBefore(date: Date): Date {
	const previous = new Date(date);
	previous.setDate(previous.getDate() - 1);
	return previous;
}

function periodStartFor(habit: Habit, frequency: string, date: Date): Date {
	const start = new Date(date);
	if (frequency === "semaine") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
	else if (frequency === "quinzaine") {
		const anchor = getHabitDateForDate(new Date(habit.createdAt ?? date));
		const anchorDate = new Date(`${anchor}T12:00:00`);
		const elapsedDays = Math.floor((Date.parse(`${formatLocalDate(date)}T12:00:00`) - Date.parse(`${anchor}T12:00:00`)) / 86_400_000);
		start.setTime(anchorDate.getTime());
		start.setDate(start.getDate() + Math.max(0, Math.floor(elapsedDays / 14)) * 14);
	} else if (frequency === "mois") start.setDate(1);
	else if (frequency === "semestre") start.setMonth(start.getMonth() < 6 ? 0 : 6, 1);
	else start.setMonth(0, 1);
	return start;
}

export function calculateCurrentStreak(habit: Habit, asOfDate = get_4to4_gliding_day()): number {
	const target = habit.iteration || 1;
	const frequency = habit.frequency;
	const today = new Date(`${asOfDate}T12:00:00`);
	if (typeof frequency === "string" && ["semaine", "quinzaine", "mois", "semestre", "an"].includes(frequency)) {
		let start = periodStartFor(habit, frequency, today);
		let end = new Date(today);
		if (formatLocalDate(end) > formatLocalDate(dayBefore(nextPeriodStart(frequency, start)))) end = dayBefore(nextPeriodStart(frequency, start));
		if (completedInRange(habit, formatLocalDate(start), formatLocalDate(end)) < target) {
			end = dayBefore(start);
			start = previousPeriodStart(frequency, start);
		}
		let streak = 0;
		for (let checked = 0; checked < 1200; checked++) {
			if (completedInRange(habit, formatLocalDate(start), formatLocalDate(end)) < target) break;
			streak++;
			end = dayBefore(start);
			start = previousPeriodStart(frequency, start);
		}
		return streak;
	}
	const currentDayCount = completedOn(habit, asOfDate);
	const cursor = currentDayCount >= target ? today : new Date(today.setDate(today.getDate() - 1));
	let streak = 0;
	for (let checked = 0; checked < 3660; checked++) {
		const day = formatLocalDate(cursor);
		const dayName = getDayName(day);
		const scheduled = frequency === "daily"
			|| frequency === "weekend" && ["saturday", "sunday"].includes(dayName)
			|| typeof frequency === "object" && frequency.days.includes(dayName as typeof frequency.days[number]);
		if (scheduled) {
			if (completedOn(habit, day) < target) break;
			streak++;
		}
		cursor.setDate(cursor.getDate() - 1);
	}
	return streak;
}

export function calculateLongestStreak(habit: Habit): number {
	const dates = (habit.completedLogs ?? [])
		.filter(isCompleted)
		.map(getHabitDateForLog)
		.filter((date): date is string => date !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(date))
		.sort();
	if (dates.length === 0) return 0;

	const frequency = habit.frequency;
	const target = habit.iteration || 1;
	const today = get_4to4_gliding_day();
	let streak = 0;
	let longest = 0;
	if (typeof frequency === "string" && ["semaine", "quinzaine", "mois", "semestre", "an"].includes(frequency)) {
		let start = periodStartFor(habit, frequency, new Date(`${dates[0]}T12:00:00`));
		const lastStart = periodStartFor(habit, frequency, new Date(`${today}T12:00:00`));
		for (let checked = 0; checked < 1200 && formatLocalDate(start) <= formatLocalDate(lastStart); checked++) {
			const end = dayBefore(nextPeriodStart(frequency, start));
			if (formatLocalDate(end) > today) end.setTime(new Date(`${today}T12:00:00`).getTime());
			if (completedInRange(habit, formatLocalDate(start), formatLocalDate(end)) >= target) {
				streak++;
				longest = Math.max(longest, streak);
			} else {
				streak = 0;
			}
			start = nextPeriodStart(frequency, start);
		}
		return longest;
	}

	const firstDate = new Date(`${dates[0]}T12:00:00`);
	const cutoff = new Date(`${today}T12:00:00`);
	cutoff.setDate(cutoff.getDate() - 3659);
	if (firstDate < cutoff) firstDate.setTime(cutoff.getTime());
	for (let checked = 0; checked < 3660 && formatLocalDate(firstDate) <= today; checked++) {
		const day = formatLocalDate(firstDate);
		const dayName = getDayName(day);
		const scheduled = frequency === "daily"
			|| frequency === "weekend" && ["saturday", "sunday"].includes(dayName)
			|| typeof frequency === "object" && frequency.days.includes(dayName as typeof frequency.days[number]);
		if (scheduled) {
			if (completedOn(habit, day) >= target) {
				streak++;
				longest = Math.max(longest, streak);
			} else {
				streak = 0;
			}
		}
		firstDate.setDate(firstDate.getDate() + 1);
	}
	return longest;
}

export function hasReachedDailyIterations(habit: Habit): boolean {
	return getCompletionsToday(habit) >= (habit.iteration || 1);
}

export function hasReachedWeeklyIterations(habit: Habit): boolean {
	return getCompletionsThisWeek(habit) >= getExpectedCompletionsThisWeek(habit);
}
