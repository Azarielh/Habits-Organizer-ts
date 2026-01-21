export type habitsLogs = {
	name: string;
	completedLogs: CompletedLog[];
  };

export type DeleteHabit = {
	name: string;
  };

export type ToggleHabit = {
	cmd: string;
	name: string;
	completedLogs: CompletedLog[];
};

export type CompletedLog = {
	date: string;
	status: string;
	completedAt: string;
	blocker: string;
}

export type TimeSlot = "morning" | "afternoon" | "evening" | "";

export type Habit = {
	name: string;
	frequency: string;
	iteration: number;
	time: TimeSlot;
	description?: string;
	createdAt?: string;
	completedLogs: CompletedLog[];
}

export type AddHabit = {
	cmd: string;
	name: string;
	habits: Habit[]
  };