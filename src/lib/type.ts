export type CustomFrequency = {
	type: "custom";
	days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
	interval?: number;
  }

export type FrequencyType = "quotidien" | "weekend" | "semaine" | "quinzaine" | "mois" | "semestre" | "an" | "custom";

export type Frequency = FrequencyType | CustomFrequency;

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


export type CompletedLog = {
	period: Frequency;
	status: status;
	completedAt?: string;
	constraints?: limitingfactor;
}

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
}

export type AddHabit = {
	name: string;
	habits: Habit[]
  };