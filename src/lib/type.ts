export type habitsLogs = {
	name: string;
	completedLogs: CompletedLog[];
  };

export type DeleteHabit = {
	name: string;
  };

export type ToggleHabit = {
	name: string;
	completedLogs: CompletedLog[];
};

export type status = "completed" | "skipped" | "missed" | "toupdate";

export type limitingfactor = "fatigue" | "malade" | "douleur" | "stress" | "motivation basse"
								| "motivation basse" | "manque temps" |"priorité plus haute"
								| "oubli" | "environnement inadapté" | "ressousses insuffisantes"
								| "imprévu social" | "contexte absent" | "chez quelqu'un d'autre";

export type FrequencyType = "quotidien" | "weekend" | "semaine" | "quinzaine" | "mois" | "semestre" | "an" | "custom";

export type CompletedLog = {
	period: FrequencyType;
	status: status;
	completedAt?: string;
	constraints?: limitingfactor;
}

export type TimeSlot = "morning" | "afternoon" | "evening" | "";

export type Habit = {
	name: string;
	frequency: string;
	iteration: number;
	time: TimeSlot;
	description?: string;
	createdAt?: string;
	currentStreak?: number;
	longestStreak?: number;
	totalCompleted?: number;
	completedLogs: CompletedLog[];
}

export type AddHabit = {
	name: string;
	habits: Habit[]
  };