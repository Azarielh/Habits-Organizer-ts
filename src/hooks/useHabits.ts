import { useEffect, useState } from "react";
import type { Habit } from "../../habits";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/habits");
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
      const response = await fetch("/api/habits", {
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

  const toggleHabit = async (name: string, done: boolean): Promise<void> => {
    try {
      const response = await fetch("/api/do-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, done }),
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
      const response = await fetch("/api/delete-habit", {
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
