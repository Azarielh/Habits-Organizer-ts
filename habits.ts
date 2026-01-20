// habits.ts

export type TimeSlot = "morning" | "afternoon" | "evening" | "";

export type FrequencyType = "quotidien" | "weekend" | "semaine" | "quinzaine" | "mois" | "semestre" | "an" | "custom";

export interface CustomFrequency {
  type: "custom";
  days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
  interval?: number; // e.g. every 2 weeks
}

export type Frequency = FrequencyType | CustomFrequency;

export interface Habit {
  name: string;
  frequency: Frequency;
  iterations: number; // number of times to do in the period
  time: TimeSlot;
  description?: string; // short description (max 150 characters)
  done?: boolean; // Deprecated - keep for compatibility but not used
  createdAt?: string; // ISO string date
  completedDates?: string[]; // YYYY-MM-DD format for each completion
  currentStreak?: number; // current consecutive days
  longestStreak?: number; // best streak ever reached
  totalCompleted?: number; // total number of completions
  completionRate?: number; // completion percentage (0-100)
}

// example initial data
export const habits: Habit[] = [
  { name: "Yoga", frequency: "quotidien", time: "morning", iterations: 1 },
  { name: "Beatsaber", frequency: "semaine", time: "evening", iterations: 3 },
];
export function addHabit(habits: Habit[], newHabit: Habit): Habit[] {
  const habitWithStats: Habit = {
    ...newHabit,
    createdAt: new Date().toISOString(),
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    completionRate: 0,
  };
  return [...habits, habitWithStats];
}

// Updates streak and detects breaks
export function updateStreakStats(habit: Habit): Habit {
  const newStreak = calculateCurrentStreak(habit);
  const oldStreak = habit.currentStreak || 0;
  
  // If streak was ongoing and stopped (broken)
  if (newStreak === 0 && oldStreak > 0) {
    // If old streak was better than the best streak, update it
    const longestStreak = habit.longestStreak || 0;
    if (oldStreak > longestStreak) {
      return {
        ...habit,
        currentStreak: 0,
        longestStreak: oldStreak,
      };
    }
    // Otherwise, just reset streak to 0
    return {
      ...habit,
      currentStreak: 0,
    };
  }
  
  // If streak increases and exceeds longest streak
  if (newStreak > (habit.longestStreak || 0)) {
    return {
      ...habit,
      currentStreak: newStreak,
      longestStreak: newStreak,
    };
  }
  
  // Otherwise, just update current streak
  return {
    ...habit,
    currentStreak: newStreak,
  };
}

export function toggleHabitDone(habits: Habit[], habitName: string, done: boolean): Habit[] {
  const now = new Date();
  const currentTime = now.toISOString(); // Full timestamp

  return habits.map((h) => {
    if (h.name === habitName) {
      const completedDates = h.completedDates || [];

      if (done) {
        // If done=true, remove last entry and decrement totalCompleted
        completedDates.pop();
        const updatedHabit = {
          ...h,
          completedDates: completedDates,
          totalCompleted: Math.max(0, (h.totalCompleted || 0) - 1),
        };
        // Update streak stats
        return updateStreakStats(updatedHabit);
      } else {
        // If done=false, add timestamp and increment totalCompleted
        completedDates.push(currentTime);
        const updatedHabit = {
          ...h,
          completedDates: completedDates.sort(),
          totalCompleted: (h.totalCompleted || 0) + 1,
        };
        // Update streak stats
        return updateStreakStats(updatedHabit);
      }
    }
    return h;
  });
}

export function getHabitByName(habits: Habit[], habitName: string): Habit | undefined {
  return habits.find((h) => h.name === habitName);
}

export function deleteHabit(habits: Habit[], habitName: string): Habit[] {
  return habits.filter((h) => h.name !== habitName);
}

export function isHabitForToday(habit: Habit): boolean {
  const today = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[today.getDay()] as
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  const frequency = habit.frequency;
  const iterations = habit.iterations || 1;
  const completionsToday = getCompletionsToday(habit);

  // Exclude non-daily habits if already completed today
  if (frequency !== "quotidien" && completionsToday > 0) {
    return false;
  }

  // Display daily habits as long as all their iterations have not been completed
  if (frequency === "quotidien" && completionsToday < iterations) {
    return true;
  }

  // Weekend : display if Saturday or Sunday
  if (frequency === "weekend") {
    return dayName === "saturday" || dayName === "sunday";
  }

  // Week : display if Monday to Friday
  if (frequency === "semaine") {
    return dayName !== "saturday" && dayName !== "sunday";
  }

  // Custom : display if the current day is in the list
  if (typeof frequency === "object" && frequency.type === "custom") {
    return frequency.days.includes(dayName);
  }

  return false;
}

// Check if habit was completed today
export function isCompletedToday(habit: Habit): boolean {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const completedDates = habit.completedDates || [];

  // Check if any date in completedDates matches today (ignoring hours)
  return completedDates.some(date => date.startsWith(today));
}

// Count completions for today only
export function getCompletionsToday(habit: Habit): number {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const completedDates = habit.completedDates || [];

  return completedDates.filter(date => date.startsWith(today)).length;
}

// Count completions for this week
export function getCompletionsThisWeek(habit: Habit): number {
  const today = new Date();
  const weekStart = new Date(today);

  // Fixer le début de la semaine au lundi à 1h du matin
  const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
  const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
  weekStart.setDate(today.getDate() + daysToMonday);
  weekStart.setHours(1, 0, 0, 0); // Lundi à 1h du matin

  const completedDates = habit.completedDates || [];

  return completedDates.filter(date => {
    const completionDate = new Date(date);
    return completionDate >= weekStart && completionDate <= today;
  }).length;
}

// Calculate expected iterations for this week based on frequency
export function getExpectedCompletionsThisWeek(habit: Habit): number {
  const frequency = habit.frequency;
  const iterations = habit.iterations || 1;
  
  if (typeof frequency === "string") {
    switch (frequency) {
      case "quotidien":
        return 7 * iterations; // All days of the week
      case "weekend":
        return 2 * iterations; // Saturday and Sunday
      case "semaine":
        return 1 * iterations; // Once a week
      case "quinzaine":
        return 0.5 * iterations; // Once every 15 days
      case "mois":
        return 0.25 * iterations; // Once a month (~7 days / 28)
      case "semestre":
        return (7 / 182.5) * iterations; // ~7 days / 182.5 days of semester
      case "an":
        return (7 / 365) * iterations; // 7 days / 365 days of the year
      default:
        return 1 * iterations;
    }
  }
  
  // If it's a custom frequency
  if (frequency.type === "custom") {
    const customDaysCount = frequency.days?.length || 0;
    return customDaysCount * iterations;
  }
  
  return 1 * iterations;
}

// Calculate global completion rate since creation
export function getGlobalCompletionRate(habit: Habit): number {
  if (!habit.createdAt) return 0;
  
  const createdDate = new Date(habit.createdAt);
  const today = new Date();
  
  // Number of days since creation
  const diffTime = Math.abs(today.getTime() - createdDate.getTime());
  const daysSinceCreation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Total expected completions
  const expectedCompletions = daysSinceCreation * habit.iterations;
  
  // Actual completions
  const actualCompletions = habit.totalCompleted || 0;
  
  if (expectedCompletions === 0) return 0;
  return Math.round((actualCompletions / expectedCompletions) * 100);
}

// Get frequency multiplier (completions per week)
function getFrequencyMultiplier(frequency: Frequency): number {
  if (typeof frequency === "string") {
    switch (frequency) {
      case "quotidien":
        return 7; // 7 days/week
      case "semaine":
        return 1; // once/week
      case "weekend":
        return 2; // 2 days/week
      case "quinzaine":
        return 0.5; // once/2 weeks
      case "mois":
        return 0.25; // once/month ≈ once/4 weeks
      case "semestre":
        return 7 / 182.5; // 7 days / 182.5 days per semester
      case "an":
        return 7 / 365; // 7 days / 365 days per year
      default:
        return 1;
    }
  }
  
  // Custom frequency: count the number of days
  if (frequency.type === "custom") {
    return frequency.days?.length || 1;
  }
  
  return 1;
}

// Calculate weighted global completion rate (all habits considered with effort weighting)
export function getWeightedGlobalCompletionRate(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const habit of habits) {
    if (!habit.createdAt) continue;
    
    const weight = (habit.iterations || 1) * getFrequencyMultiplier(habit.frequency);
    const individualRate = getGlobalCompletionRate(habit);
    
    totalWeightedScore += (individualRate / 100) * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return 0;
  
  return Math.round((totalWeightedScore / totalWeight) * 100);
}

// Calculate current streak based on frequency
export function calculateCurrentStreak(habit: Habit): number {
  const completedDates = habit.completedDates || [];
  if (completedDates.length === 0) return 0;

  const frequency = habit.frequency;
  const iterations = habit.iterations || 1;

  // For daily: count consecutive days with enough entries
  if (frequency === "quotidien") {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from the last day with valid completion
    // If today has none, look for yesterday, day before, etc.
    let currentCheckDate = new Date(today);
    
    // First, go back to find the last day with completions
    while (true) {
      const dateStr = currentCheckDate.toISOString().split("T")[0];
      const dayCompletions = completedDates.filter(date => date.startsWith(dateStr)).length;
      
      if (dayCompletions >= iterations) {
        // Found a valid day, can start the streak
        break;
      }
      
      // Go to previous day
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      
      // If we've gone back more than 365 days without finding anything, no streak
      if ((today.getTime() - currentCheckDate.getTime()) / (1000 * 60 * 60 * 24) > 365) {
        return 0;
      }
    }

    // Now, count consecutive days backwards
    while (true) {
      const dateStr = currentCheckDate.toISOString().split("T")[0];
      const dayCompletions = completedDates.filter(date => date.startsWith(dateStr)).length;
      
      if (dayCompletions < iterations) {
        // Not enough completions this day, stop the streak
        break;
      }

      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      
      if (streak > 10000) break;
    }

    return streak;
  }

  // For other frequencies: count complete consecutive periods
  if (["semaine", "mois", "an"].includes(frequency as string)) {
    return calculateStreakForPeriod(habit, frequency as string, iterations, completedDates);
  }

  // For custom: treat as weekly
  if (typeof frequency === "object" && frequency.type === "custom") {
    return calculateStreakForPeriod(habit, "custom", iterations, completedDates);
  }

  // By default: no streak for other cases
  return 0;
}

// Calculate streak for periodic frequencies (week, month, year, custom)
function calculateStreakForPeriod(habit: Habit, frequencyType: string, iterations: number, completedDates: string[]): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentPeriodEnd = new Date(today);
  let currentPeriodStart = new Date(today);

  // Determine the start of the current period
  switch (frequencyType) {
    case "semaine":
    case "custom":
      // Monday of this week
      // getDay() returns 0 for Sunday, 1 for Monday, etc.
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
      currentPeriodStart.setDate(today.getDate() + daysToMonday);
      break;
    case "mois":
      // First day of the month
      currentPeriodStart.setDate(1);
      break;
    case "an":
      // First day of the year
      currentPeriodStart.setMonth(0);
      currentPeriodStart.setDate(1);
      break;
  }

  while (true) {
    // Count completions in this period
    const completionsInPeriod = completedDates.filter(date => {
      const completionDate = new Date(date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate >= currentPeriodStart && completionDate <= currentPeriodEnd;
    }).length;

    // Check if we have enough completions to validate this period
    if (completionsInPeriod < iterations) {
      // If we don't have enough completions in the current period
      if (currentPeriodEnd.getTime() === today.getTime()) {
        break;
      }
      // If it's not the current period, stop
      break;
    }

    streak++;

    // Move to the previous period
    switch (frequencyType) {
      case "semaine":
      case "custom":
        currentPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
        currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
        break;
      case "mois":
        currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(0); // Last day of previous month
        currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
        currentPeriodStart.setDate(1);
        break;
      case "an":
        currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(0);
        currentPeriodStart.setFullYear(currentPeriodStart.getFullYear() - 1);
        currentPeriodStart.setMonth(0);
        currentPeriodStart.setDate(1);
        break;
    }

    if (streak > 10000) break;
  }

  return streak;
}