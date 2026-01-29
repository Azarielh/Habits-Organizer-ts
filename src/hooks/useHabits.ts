import { useEffect, useState } from "react";
import type { Habit } from "../../habits";
import type { CompletedLog } from "../lib/type";

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
      const data = await response.json();
      setHabits(data);
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

  const addHabit = async (newHabit: Habit): Promise<void> => {
    try {
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

  const toggleHabit = async (name: string, completedLogs: CompletedLog[], isChecked: boolean): Promise<void> => {
    try {
      const response = await fetch("/api/habitsorganizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, completedLogs, isChecked }),
      });

      if (!response.ok) throw new Error("Error toggling habit");

      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Wrapper for compatibility with the old API (done: boolean)
  const toggleHabitCompat = async (name: string, completedLogs: CompletedLog[], isChecked: boolean): Promise<void> => {
    let logs = completedLogs;
    
    if (isChecked) {
      // isChecked=true : add an entry for today
      const newLog: CompletedLog = {
        status: "completed",
        completedAt: new Date().toISOString(),
        constraints: "" as any
      };
      logs = [...logs, newLog];
    } else {
      // isChecked=false : remove the last entry (assumed to be today)
      logs = logs.slice(0, -1);
    }
    
    await toggleHabit(name, logs, isChecked);
  };

  const deleteHabit = async (name: string): Promise<void> => {
    try {
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
    toggleHabit: toggleHabitCompat,
    deleteHabit,
  };
}
