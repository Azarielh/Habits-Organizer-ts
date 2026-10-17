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

export type Status = "completed" | "skipped" | "missed" | "toupdate";
export type LimitingFactor = "fatigue" | "malade" | "douleur" | "stress" | "motivation basse"
	| "manque temps" | "priorité plus haute" | "oubli" | "environnement inadapté"
	| "ressousses insuffisantes" | "imprévu social" | "contexte absent" | "chez quelqu'un d'autre"
	| "début tardif";
export type CompletedLog = {
	status: Status;
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
	time: TimeSlot;
	description?: string;
	createdAt?: string;
	currentStreak?: number;
	longestStreak?: number;
	totalCompleted?: number;
	completedLogs: CompletedLog[];
};

export type AddHabit = Pick<Habit, "name" | "frequency" | "iteration" | "time"> & Partial<Pick<Habit, "description">>;
export type ToggleHabit = { name: string; habitDate: string; periodKey: string; iterationIndex: number; isChecked: boolean };
export type DeleteHabit = { name: string };

export function isTimeSlot(payload: unknown): payload is TimeSlot {
	return payload === "morning" || payload === "afternoon" || payload === "evening" || payload === "";
}

export function isAddHabitPayload(payload: unknown): payload is AddHabit {
	if (!payload || typeof payload !== "object") return false;
	const candidate = payload as Partial<AddHabit>;
	return typeof candidate.name === "string" && candidate.name.trim().length > 0
		&& isFrequency(candidate.frequency) && Number.isInteger(candidate.iteration)
		&& (candidate.iteration ?? 0) > 0 && isTimeSlot(candidate.time);
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
