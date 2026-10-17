import { useEffect, useState } from "react";
import type { AddHabit, Habit } from "../lib/type";
import type { ToggleHabit } from "../lib/type";
import { calculateCurrentStreak, calculateLongestStreak } from "../../habits";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/habitsorganizer");
      if (!response.ok) throw new Error("Error loading habits");
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid habits response");
      setHabits(data.map((value) => {
        const habit = value as Habit;
        const completedLogs = Array.isArray(habit.completedLogs) ? habit.completedLogs : [];
        const normalized = { ...habit, iteration: Math.max(1, habit.iteration || 1), completedLogs };
        return {
          ...normalized,
          currentStreak: calculateCurrentStreak(normalized),
          longestStreak: calculateLongestStreak(normalized),
          totalCompleted: completedLogs.filter((log) => log.status === "completed").length,
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Load habits on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const addHabit = async (newHabit: AddHabit): Promise<void> => {
    try {
      setError("");
      const response = await fetch("/api/habitsorganizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHabit),
      });

      if (!response.ok) throw new Error("Error adding habit");
      
      // Refetch all habits to ensure sync
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const toggleHabit = async (payload: ToggleHabit): Promise<void> => {
    try {
      setError("");
      const response = await fetch("/api/habitsorganizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error toggling habit");

      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const deleteHabit = async (name: string): Promise<void> => {
    try {
      setError("");
      const response = await fetch("/api/habitsorganizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Error deleting habit");

      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  return {
    habits,
    loading,
    error,
    loadHabits,
    addHabit,
    toggleHabit,
    deleteHabit,
  };
}
