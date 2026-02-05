export type CustomFrequency = {
	type: "custom";
	days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
	interval?: number;
}
export function isCustomFrequency(payload: any): payload is CustomFrequency {
	return (payload as CustomFrequency).type === "custom" && Array.isArray((payload as CustomFrequency).days);
}

export type FrequencyType = "daily" | "weekend" | "semaine" | "quinzaine" | "mois" | "semestre" | "an" | "custom";
export function isFrequencyType(payload: any): payload is FrequencyType {
	return (payload === "daily" || payload === "weekend" || payload === "semaine" || payload === "quinzaine"
		|| payload === "mois" || payload === "semestre" || payload === "an" || payload === "custom");
}

export type Frequency = FrequencyType | CustomFrequency;
export function isFrequency(payload: any): payload is Frequency {
	return isFrequencyType(payload) || isCustomFrequency(payload);
}

export type habitsLogs = {
	name: string;
	completedLogs: CompletedLog[];
  };
export function isHabitsLogsPayload(payload: any): payload is habitsLogs {
	return (payload as habitsLogs).name !== undefined && (payload as habitsLogs).completedLogs !== undefined;
}

export type DeleteHabit = {
	name: string;
  };
export function isDeleteHabitPayload(payload: any): payload is DeleteHabit {
	// DeleteHabit: ONLY name, no other fields (most specific)
	const hasOnlyName = typeof payload?.name === "string" 
		&& !payload?.completedLogs 
		&& !payload?.isChecked
		&& !payload?.frequency
		&& !payload?.habits;
	return hasOnlyName;
}

export type ToggleHabit = {
	name: string;
	completedLogs: CompletedLog[];
	isChecked: boolean;
};
export function isToggleHabitPayload(payload: any): payload is ToggleHabit {
	return (typeof payload?.name === "string"
					&& payload?.completedLogs
					&& Array.isArray(payload?.completedLogs)
					&& typeof payload?.isChecked === "boolean");
  }

export type status = "completed" | "skipped" | "missed" | "toupdate";
export function isStatus(payload: any): payload is status {
	return (payload === "completed" || payload === "skipped" || payload === "missed" || payload === "toupdate");
}

export type limitingfactor = "fatigue" | "malade" | "douleur" | "stress" | "motivation basse"
								| "motivation basse" | "manque temps" |"priorité plus haute"
								| "oubli" | "environnement inadapté" | "ressousses insuffisantes"
								| "imprévu social" | "contexte absent" | "chez quelqu'un d'autre";
export function isLimitingFactor(payload: any): payload is limitingfactor {
	return (payload === "fatigue" || payload === "malade" || payload === "douleur" || payload === "stress"
		|| payload === "motivation basse" || payload === "manque temps" || payload ==="priorité plus haute"
		|| payload === "oubli" || payload === "environnement inadapté" || payload === "ressousses insuffisantes"
		|| payload === "imprévu social" || payload === "contexte absent" || payload === "chez quelqu'un d'autre");
}

export type CompletedLog = {
	status: status;
	completedAt?: string;
	constraints?: limitingfactor;
}
export function isCompletedLog(payload: any): payload is CompletedLog {
	return (payload as CompletedLog).status !== undefined;
}

export type TimeSlot = "morning" | "afternoon" | "evening" | "";
export function isTimeSlot(payload: any): payload is TimeSlot {
	return (payload === "morning" || payload === "afternoon" || payload === "evening" || payload === "");
}

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
}

export function isHabit(payload: any): payload is Habit {
	return (payload as Habit).name !== undefined && (payload as Habit).frequency !== undefined;
}
export type AddHabit = {
	name: string;
	frequency: Frequency;
	iteration: number;
	time: TimeSlot;
	description?: string;
	habits?: Habit[]
};

export function isAddHabitPayload(payload: any): payload is AddHabit {
		// AddHabit: has name + frequency (new habit structure)
		return (typeof payload?.name === "string" 
						&& payload?.frequency !== undefined);
  }