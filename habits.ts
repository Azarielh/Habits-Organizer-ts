import type { CompletedLog, Frequency, Habit } from "./src/lib/type";
import { formatLocalDate, get_4to4_gliding_day, getHabitDateForDate } from "./src/lib/get_4to4_gliding_day";

export type { Habit } from "./src/lib/type";

const isCompleted = (log: CompletedLog) => log.status === "completed";

export function getHabitDateForLog(log: CompletedLog): string | undefined {
	if (log.habitDate) return log.habitDate;
	return log.completedAt ? getHabitDateForDate(new Date(log.completedAt)) : undefined;
}

export function getHabitPeriodKey(habit: Habit, dateKey: string): string {
	if (typeof habit.frequency !== "string" || habit.frequency === "daily") return dateKey;
	if (habit.frequency === "weekend") {
		if (!habit.iterationInterval || !habit.lateIterationPolicy) return dateKey;
		const date = new Date(`${dateKey}T12:00:00`);
		if (date.getDay() === 0) date.setDate(date.getDate() - 1);
		return formatLocalDate(date);
	}
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
		if (Number.isInteger(log.iterationIndex) && log.iterationIndex! >= 0) {
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
	if (habit.allowExtraIterations) {
		let next = iterationCount;
		while (completed.has(next)) next++;
		return next;
	}
	return null;
}

function addIterationInterval(habit: Habit, dateKey: string, interval: number): string {
	const date = new Date(`${dateKey}T12:00:00`);
	if (habit.frequency === "mois") date.setDate(date.getDate() + interval * 7);
	else if (habit.frequency === "semestre" || habit.frequency === "an") {
		const dayOfMonth = date.getDate();
		date.setDate(1);
		date.setMonth(date.getMonth() + interval);
		const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		date.setDate(Math.min(dayOfMonth, lastDayOfMonth));
	}
	else date.setDate(date.getDate() + interval);
	return formatLocalDate(date);
}

function getIterationPeriodEnd(habit: Habit, periodKey: string): string {
	const end = new Date(`${periodKey}T12:00:00`);
	if (habit.frequency === "weekend" && habit.iterationInterval && habit.lateIterationPolicy) end.setDate(end.getDate() + 1);
	else if (habit.frequency === "semaine") end.setDate(end.getDate() + 6);
	else if (habit.frequency === "quinzaine") end.setDate(end.getDate() + 13);
	else if (habit.frequency === "mois") end.setMonth(end.getMonth() + 1, 0);
	else if (habit.frequency === "semestre") end.setMonth(end.getMonth() + 6, 0);
	else if (habit.frequency === "an") end.setFullYear(end.getFullYear() + 1, 0, 0);
	return formatLocalDate(end);
}

/** Whether the next repetition can be completed on this day under its configured spacing rule. */
export function isHabitIterationDue(habit: Habit, periodKey: string, dateKey: string, iterationIndex?: number): boolean {
	const nextIndex = getNextIterationIndex(habit, periodKey);
	if (nextIndex === null || iterationIndex !== undefined && iterationIndex !== nextIndex) return false;
	if (nextIndex >= habit.iteration || habit.iteration <= 1 || !habit.iterationInterval || !habit.lateIterationPolicy) return true;

	const previousCompletions = (habit.completedLogs ?? [])
		.filter((log) => log.status === "completed")
		.map((log) => getHabitDateForLog(log))
		.filter((day): day is string => Boolean(day) && day! <= dateKey)
		.sort();
	const lastCompletion = previousCompletions.at(-1);
	if (!lastCompletion) return true;

	let interval = habit.iterationInterval;
	const remainingIterations = habit.iteration - nextIndex;
	const periodEnd = getIterationPeriodEnd(habit, periodKey);
	let nextDue: string;
	if (habit.lateIterationPolicy === "spread") {
		const fits = (candidate: number) => addIterationInterval(habit, lastCompletion, candidate * remainingIterations) <= periodEnd;
		if (fits(interval)) nextDue = addIterationInterval(habit, lastCompletion, interval);
		else {
			const daysRemaining = Math.max(0, Math.round((Date.parse(`${periodEnd}T12:00:00`) - Date.parse(`${lastCompletion}T12:00:00`)) / 86_400_000));
			const reducedGap = Math.max(1, Math.ceil(daysRemaining / remainingIterations));
			const due = new Date(`${lastCompletion}T12:00:00`);
			due.setDate(due.getDate() + reducedGap);
			nextDue = formatLocalDate(due);
		}
	} else {
		nextDue = addIterationInterval(habit, lastCompletion, interval);
	}

	return nextDue <= periodEnd && dateKey >= nextDue;
}

function getDayName(dateKey: string): string {
	return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

function completedOn(habit: Habit, dateKey: string): number {
	return (habit.completedLogs ?? []).filter((log) => isCompleted(log) && getHabitDateForLog(log) === dateKey).length;
}

type PeriodProgress = { completed: number; notApplicable: number };

function getPeriodProgress(habit: Habit, start: string, end: string, periodKey: string): PeriodProgress {
	const completedSlots = new Set<number>();
	const notApplicableSlots = new Set<number>();
	let legacyCompleted = 0;
	let legacyNotApplicable = 0;
	for (const log of habit.completedLogs ?? []) {
		if (log.status !== "completed" && log.status !== "not_applicable") continue;
		const date = getHabitDateForLog(log);
		const logPeriod = log.periodKey ?? (date ? getHabitPeriodKey(habit, date) : undefined);
		if (logPeriod !== periodKey || date && (date < start || date > end)) continue;
		if (Number.isInteger(log.iterationIndex) && log.iterationIndex! >= 0) {
			if (log.status === "completed") completedSlots.add(log.iterationIndex!);
			else notApplicableSlots.add(log.iterationIndex!);
		} else if (log.status === "completed") legacyCompleted++;
		else legacyNotApplicable++;
	}
	for (const index of completedSlots) notApplicableSlots.delete(index);
	return {
		completed: completedSlots.size + legacyCompleted,
		notApplicable: notApplicableSlots.size + legacyNotApplicable,
	};
}

function periodIsComplete(progress: PeriodProgress, target: number): boolean {
	return progress.completed > 0 && progress.completed + progress.notApplicable >= target;
}

function periodIsNeutral(progress: PeriodProgress, target: number): boolean {
	return progress.completed === 0 && progress.notApplicable >= target;
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

	return habit.allowExtraIterations || getCompletionsForCurrentPeriod(habit, today) < (habit.iteration || 1);
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
		const currentPeriodProgress = getPeriodProgress(habit, formatLocalDate(start), formatLocalDate(end), formatLocalDate(start));
		if (!periodIsComplete(currentPeriodProgress, target) && !periodIsNeutral(currentPeriodProgress, target)) {
			end = dayBefore(start);
			start = previousPeriodStart(frequency, start);
		}
		let streak = 0;
		for (let checked = 0; checked < 1200; checked++) {
			const progress = getPeriodProgress(habit, formatLocalDate(start), formatLocalDate(end), formatLocalDate(start));
			if (periodIsComplete(progress, target)) streak++;
			else if (!periodIsNeutral(progress, target)) break;
			end = dayBefore(start);
			start = previousPeriodStart(frequency, start);
		}
		return streak;
	}
	const currentPeriodKey = getHabitPeriodKey(habit, asOfDate);
	const currentDayProgress = getPeriodProgress(habit, asOfDate, asOfDate, currentPeriodKey);
	const cursor = periodIsComplete(currentDayProgress, target) || periodIsNeutral(currentDayProgress, target)
		? today
		: new Date(today.setDate(today.getDate() - 1));
	let streak = 0;
	for (let checked = 0; checked < 3660; checked++) {
		const day = formatLocalDate(cursor);
		const dayName = getDayName(day);
		const scheduled = frequency === "daily"
			|| frequency === "weekend" && ["saturday", "sunday"].includes(dayName)
			|| typeof frequency === "object" && frequency.days.includes(dayName as typeof frequency.days[number]);
		if (scheduled) {
			const progress = getPeriodProgress(habit, day, day, getHabitPeriodKey(habit, day));
			if (periodIsComplete(progress, target)) streak++;
			else if (!periodIsNeutral(progress, target)) break;
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
			const progress = getPeriodProgress(habit, formatLocalDate(start), formatLocalDate(end), formatLocalDate(start));
			if (periodIsComplete(progress, target)) {
				streak++;
				longest = Math.max(longest, streak);
			} else if (!periodIsNeutral(progress, target)) {
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
			const progress = getPeriodProgress(habit, day, day, getHabitPeriodKey(habit, day));
			if (periodIsComplete(progress, target)) {
				streak++;
				longest = Math.max(longest, streak);
			} else if (!periodIsNeutral(progress, target)) {
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
