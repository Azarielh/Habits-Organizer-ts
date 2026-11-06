export type DayName = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type CustomFrequency = {
	type: "custom";
	days: DayName[];
	interval?: number;
};

export type FrequencyType = "daily" | "weekend" | "semaine" | "quinzaine" | "mois" | "semestre" | "an";
export type Frequency = FrequencyType | CustomFrequency;

export function isFrequency(payload: unknown): payload is Frequency {
	if (typeof payload === "string") {
		return ["daily", "weekend", "semaine", "quinzaine", "mois", "semestre", "an"].includes(payload);
	}
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Partial<CustomFrequency>;
	return candidate.type === "custom"
		&& Array.isArray(candidate.days)
		&& candidate.days.every((day) => ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(day));
}

export type Status = "completed" | "skipped" | "missed" | "not_applicable" | "toupdate";
export type LimitingFactor = "fatigue" | "malade" | "douleur" | "stress" | "motivation basse"
	| "manque temps" | "priorité plus haute" | "oubli" | "environnement inadapté"
	| "ressousses insuffisantes" | "imprévu social" | "contexte absent" | "chez quelqu'un d'autre"
	| "début tardif";
export type CompletedLog = {
	status: Status;
	reason?: "tired" | "forgot" | "unmotivated" | "unspecified";
	completedAt?: string;
	/** Client-local habit day; the day changes at 04:00. */
	habitDate?: string;
	/** Start date of the schedule period this completion belongs to. */
	periodKey?: string;
	/** Repetition position for a habit day, starting at zero. */
	iterationIndex?: number;
	constraints?: LimitingFactor | "";
};

export type TimeSlot = "morning" | "afternoon" | "evening" | "";
export type Habit = {
	name: string;
	frequency: Frequency;
	iteration: number;
	/** Desired gap between repetitions, measured in the unit implied by frequency. */
	iterationInterval?: number;
	lateIterationPolicy?: "spread" | "respect";
	allowExtraIterations?: boolean;
	time: TimeSlot;
	description?: string;
	createdAt?: string;
	currentStreak?: number;
	longestStreak?: number;
	totalCompleted?: number;
	completedLogs: CompletedLog[];
};

export type AddHabit = Pick<Habit, "name" | "frequency" | "iteration" | "time"> & Partial<Pick<Habit, "description" | "allowExtraIterations" | "iterationInterval" | "lateIterationPolicy">>;
export type ToggleHabit = { name: string; habitDate: string; periodKey: string; iterationIndex: number; isChecked: boolean };
export type ReviewHabit = { action: "review"; name: string; habitDate: string; periodKey: string; iterationIndex: number; status: "completed" | "missed" | "not_applicable"; reason?: "tired" | "forgot" | "unmotivated" | "unspecified" };
export type DeleteHabit = { name: string };

export function isTimeSlot(payload: unknown): payload is TimeSlot {
	return payload === "morning" || payload === "afternoon" || payload === "evening" || payload === "";
}

export function isAddHabitPayload(payload: unknown): payload is AddHabit {
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Partial<AddHabit>;
	const requiresInterval = (candidate.iteration ?? 0) > 1
		&& candidate.frequency !== "daily" && typeof candidate.frequency !== "object";
	return typeof candidate.name === "string" && candidate.name.trim().length > 0
		&& isFrequency(candidate.frequency) && Number.isInteger(candidate.iteration)
		&& (candidate.iteration ?? 0) > 0 && isTimeSlot(candidate.time)
		&& (candidate.iterationInterval === undefined || Number.isInteger(candidate.iterationInterval) && candidate.iterationInterval > 0)
		&& (candidate.lateIterationPolicy === undefined || candidate.lateIterationPolicy === "spread" || candidate.lateIterationPolicy === "respect")
		&& (!requiresInterval
			|| Number.isInteger(candidate.iterationInterval) && (candidate.iterationInterval ?? 0) > 0
				&& (candidate.lateIterationPolicy === "spread" || candidate.lateIterationPolicy === "respect"));
}

export function isReviewHabitPayload(payload: unknown): payload is ReviewHabit {
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Partial<ReviewHabit>;
	return candidate.action === "review" && typeof candidate.name === "string"
		&& typeof candidate.habitDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.habitDate)
		&& typeof candidate.periodKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.periodKey)
		&& Number.isInteger(candidate.iterationIndex) && (candidate.iterationIndex ?? -1) >= 0
		&& (candidate.status === "completed" && candidate.reason === undefined
			|| candidate.status === "missed" && ["tired", "forgot", "unmotivated", "unspecified"].includes(candidate.reason ?? "")
			|| candidate.status === "not_applicable");
}

export function isToggleHabitPayload(payload: unknown): payload is ToggleHabit {
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Partial<ToggleHabit>;
	return typeof candidate.name === "string" && typeof candidate.habitDate === "string"
		&& /^\d{4}-\d{2}-\d{2}$/.test(candidate.habitDate)
		&& typeof candidate.periodKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.periodKey)
		&& Number.isInteger(candidate.iterationIndex) && (candidate.iterationIndex ?? -1) >= 0
		&& typeof candidate.isChecked === "boolean";
}

export function isDeleteHabitPayload(payload: unknown): payload is DeleteHabit {
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Record<string, unknown>;
	return typeof candidate.name === "string" && Object.keys(candidate).length === 1;
}
