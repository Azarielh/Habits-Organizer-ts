// habits.ts
import type { CompletedLog, Frequency, TimeSlot, limitingfactor } from "./src/lib/type";


export interface Habit {
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

// Adds a new habit with initial stats
export function addHabit(habits: Habit[], newHabit: Habit): Habit[] {
  const habitWithStats: Habit = {
    ...newHabit,
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    completedLogs: [],
  };
  return [...habits, habitWithStats];
}

// Updates streak and detects breaks
export function updateStreakStats(habit: Habit): Habit {
  // Cette fonction est dépréciée - on ne recalcule plus les streaks
  return habit;
}

export function toggleHabitDone(habits: Habit[], habitName: string, done: boolean): Habit[] {
  const now = new Date();
  const currentTime = now.toISOString();

  return habits.map((h) => {
    if (h.name === habitName) {
      const completedLogs = h.completedLogs || [];

      if (done) {
        completedLogs.pop();
      } else {
        const newLog: CompletedLog = {
          period: h.frequency,
          status: "completed",
          completedAt: currentTime,
          constraints: "" as any
        };
        completedLogs.push(newLog);
      }
      return { ...h, completedLogs };
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

  const frequency = habit.frequency as string | object;

  // Daily habits - always apply today
  if (typeof frequency === "string" && frequency === "daily") {
    return true;
  }

  // Weekend : display if Saturday or Sunday
  if (typeof frequency === "string" && frequency === "weekend") {
    return dayName === "saturday" || dayName === "sunday";
  }

  // Week : display if Monday to Friday
  if (typeof frequency === "string" && frequency === "semaine") {
    return dayName !== "saturday" && dayName !== "sunday";
  }

  // Custom : display if the current day is in the list
  if (typeof frequency === "object" && (frequency as any).type === "custom") {
    return (frequency as any)?.days.includes(dayName);
  }

  return false;
}

// Check if habit was completed today
export function isCompletedToday(habit: Habit): boolean {
  const today = new Date().toISOString().split("T")[0];
  const completedLogs = habit.completedLogs || [];

  return completedLogs.some(log => log.completedAt?.split("T")[0] === today);
}

// Count completions for today only
export function getCompletionsToday(habit: Habit): number {
  const today = new Date().toISOString().split("T")[0];
  const completedLogs = habit.completedLogs || [];

  return completedLogs.filter(log => log.completedAt?.split("T")[0] === today).length;
}

// Count completions for this week
export function getCompletionsThisWeek(habit: Habit): number {
  const today = new Date();
  const weekStart = new Date(today);

  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
  weekStart.setDate(today.getDate() + daysToMonday);
  weekStart.setHours(1, 0, 0, 0);

  const completedLogs = habit.completedLogs || [];

  return completedLogs.filter(log => {
    const logDate = new Date(log.completedAt?.split("T")[0] || "");
    return logDate >= weekStart && logDate <= today;
  }).length;
}

// Calculate expected iterations for this week based on frequency
export function getExpectedCompletionsThisWeek(habit: Habit): number {
  const frequency = habit.frequency;
  const iterations = habit.iteration || 1;
  
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
  if ((frequency as any).type === "custom") {
    const customDaysCount = (frequency as any).days?.length || 0;
    return customDaysCount * iterations;
  }
  
  return 1 * iterations;
}

// Calculate global completion rate since creation
export function getGlobalCompletionRate(habit: Habit): number {
  if (!habit.createdAt) return 0;
  
  const createdDate = new Date(habit.createdAt);
  const today = new Date();
  
  const diffTime = Math.abs(today.getTime() - createdDate.getTime());
  const daysSinceCreation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const expectedCompletions = daysSinceCreation * habit.iteration;
  const actualCompletions = habit.completedLogs?.length || 0;
  
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
  if ((frequency as any).type === "custom") {
    return (frequency as any).days?.length || 1;
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
    
    const weight = (habit.iteration || 1) * getFrequencyMultiplier(habit.frequency);
    const individualRate = getGlobalCompletionRate(habit);
    
    totalWeightedScore += (individualRate / 100) * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return 0;
  
  return Math.round((totalWeightedScore / totalWeight) * 100);
}

// Calculate current streak based on frequency
export function calculateCurrentStreak(habit: Habit): number {
  const completedDates = habit.completedLogs || [];
  if (completedDates.length === 0) return 0;

  const frequency = habit.frequency;
  const iterations = habit.iteration || 1;

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
      const dayCompletions = completedDates.filter((log): boolean => log.completedAt?.split("T")[0] === dateStr).length;
      
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
      const dayCompletions: number = completedDates.filter((log): boolean => log.completedAt?.split("T")[0] === dateStr).length;
      
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
  if (typeof frequency === "object" && (frequency as any).type === "custom") {
    return calculateStreakForPeriod(habit, "custom", iterations, completedDates);
  }

  // By default: no streak for other cases
  return 0;
}

// Calculate streak for periodic frequencies (week, month, year, custom)
function calculateStreakForPeriod(habit: Habit, frequencyType: string, iterations: number, completedDates: CompletedLog[]): number {
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
    const completionsInPeriod = completedDates.filter(log => {
      if (!log.completedAt) return false;
      const completionDate = new Date(log.completedAt);
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