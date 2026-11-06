import type { Habit, ReviewHabit } from "./type";
import { calculateCurrentStreak, calculateLongestStreak, getCompletedIterationIndexes, getHabitDateForLog, getHabitPeriodKey } from "../../habits";
import { formatLocalDate } from "./get_4to4_gliding_day";

function shiftDay(day: string, offset: number): string {
	const date = new Date(`${day}T12:00:00`);
	date.setDate(date.getDate() + offset);
	return formatLocalDate(date);
}

function periodEnd(habit: Habit, day: string): string {
	const start = new Date(`${getHabitPeriodKey(habit, day)}T12:00:00`);
	if (habit.frequency === "semaine") start.setDate(start.getDate() + 6);
	else if (habit.frequency === "weekend" && habit.iterationInterval && habit.lateIterationPolicy) start.setDate(start.getDate() + 1);
	else if (habit.frequency === "quinzaine") start.setDate(start.getDate() + 13);
	else if (habit.frequency === "mois") start.setMonth(start.getMonth() + 1, 0);
	else if (habit.frequency === "semestre") start.setMonth(start.getMonth() + 6, 0);
	else if (habit.frequency === "an") start.setFullYear(start.getFullYear() + 1, 0, 0);
	return formatLocalDate(start);
}

export function isReviewDueDate(habit: Habit, day: string): boolean {
	if (habit.frequency === "daily") return true;
	const weekday = new Date(`${day}T12:00:00`).getDay();
	if (habit.frequency === "weekend") return habit.iterationInterval && habit.lateIterationPolicy ? weekday === 0 : weekday === 0 || weekday === 6;
	if (typeof habit.frequency === "object") return habit.frequency.days.includes((
		["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
	)[weekday]!);
	return periodEnd(habit, day) === day;
}

export function getReviewItems(habits: Habit[], now = new Date()) {
	const today = formatLocalDate(now);
	const startDay = now.getHours() >= 20 ? today : shiftDay(today, -1);
	return habits.flatMap((habit) => {
		const scheduledDay = startDay;
		if (!isReviewDueDate(habit, scheduledDay)) return [];
		if (habit.createdAt && new Date(habit.createdAt) > new Date(`${scheduledDay}T20:00:00`)) return [];
		const periodKey = getHabitPeriodKey(habit, scheduledDay);
		const relevant = (habit.completedLogs ?? []).filter((log) => (log.periodKey ?? (getHabitDateForLog(log) ? getHabitPeriodKey(habit, getHabitDateForLog(log)!) : undefined)) === periodKey);
		const completedSlots = getCompletedIterationIndexes(habit, periodKey);
		const items = [];
		for (let index = 0; index < habit.iteration; index++) {
			const existing = relevant.find((log) => log.iterationIndex === index && ["missed", "not_applicable"].includes(log.status));
			if (completedSlots.has(index)) continue;
			items.push({ habit, habitDate: scheduledDay, periodKey, iterationIndex: index, status: existing?.status as "missed" | "not_applicable" | undefined, reason: existing?.reason });
		}
		return items;
	}).sort((a, b) => Number(Boolean(a.status)) - Number(Boolean(b.status)));
}

export function applyReview(payload: ReviewHabit, habits: Habit[]): Habit[] {
	const matches = habits.filter((habit) => habit.name === payload.name);
	if (matches.length !== 1) throw new Error("Habit not found or name is ambiguous");
	return habits.map((habit) => {
		if (habit.name !== payload.name) return habit;
		const logs = habit.completedLogs ?? [];
		if (logs.some((log) => log.status === "completed" && log.periodKey === payload.periodKey && log.iterationIndex === payload.iterationIndex)) return habit;
		const exists = logs.some((log) => log.periodKey === payload.periodKey && log.iterationIndex === payload.iterationIndex && ["missed", "not_applicable"].includes(log.status));
		const entry = { status: payload.status, ...(payload.reason ? { reason: payload.reason } : {}), completedAt: new Date().toISOString(), habitDate: payload.habitDate, periodKey: payload.periodKey, iterationIndex: payload.iterationIndex } as const;
		const isSameReviewSlot = (log: Habit["completedLogs"][number]) => log.periodKey === payload.periodKey && log.iterationIndex === payload.iterationIndex;
		let completedLogs = payload.status === "completed"
			? [...logs.filter((log) => !(isSameReviewSlot(log) && ["missed", "not_applicable"].includes(log.status))), entry]
			: exists
				? logs.map((log) => isSameReviewSlot(log) && ["missed", "not_applicable"].includes(log.status) ? entry : log)
				: [...logs, entry];
		const updated: Habit = { ...habit, completedLogs };
		updated.currentStreak = calculateCurrentStreak(updated);
		updated.longestStreak = calculateLongestStreak(updated);
		updated.totalCompleted = completedLogs.filter((log) => log.status === "completed").length;
		return updated;
	});
}

/** Materialize every scheduled review window that expired since the previous server checkpoint. */
export function materializeExpiredReviews(habits: Habit[], lastProcessedAt: Date, now = new Date()): Habit[] {
	let updated = habits;
	const checkpoint = lastProcessedAt.getTime();
	const endDay = formatLocalDate(now);
	let day = shiftDay(formatLocalDate(lastProcessedAt), -1);
	for (let checked = 0; checked < 20_000 && day <= endDay; checked++, day = shiftDay(day, 1)) {
		const closesAt = new Date(`${shiftDay(day, 1)}T20:00:00`);
		if (closesAt.getTime() <= checkpoint || closesAt.getTime() > now.getTime()) continue;
		const pending = getReviewItems(updated, new Date(`${day}T21:00:00`)).filter((item) => !item.status);
		for (const item of pending) {
			updated = applyReview({
				action: "review", name: item.habit.name, habitDate: item.habitDate,
				periodKey: item.periodKey, iterationIndex: item.iterationIndex,
				status: "missed", reason: "unspecified",
			}, updated);
		}
	}
	return updated;
}
