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

  const toggleHabit = async (name: string, completedLogs: CompletedLog[]): Promise<void> => {
    try {
      const habit = habits.find(h => h.name === name);
      if (!habit) throw new Error("Habit not found");
      
      const today = new Date().toISOString().split('T')[0];
      
      // Vérifier si une entrée existe déjà pour aujourd'hui
      const todayLogIndex = completedLogs.findIndex(log => log.date === today);
      
      let updatedLogs: CompletedLog[];
      
      if (todayLogIndex >= 0) {
        // Toggle : si elle existe, la supprimer
        updatedLogs = completedLogs.filter((_, index) => index !== todayLogIndex);
      } else {
        // Ajouter une nouvelle entrée pour aujourd'hui
        const newLog: CompletedLog = {
          period: habit.frequency as any,
          status: "completed",
          completedAt: new Date().toISOString(),
          constraints: "" as any
        };
        updatedLogs = [...completedLogs, newLog];
      }
      
      const response = await fetch("/api/do-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, completedLogs: updatedLogs }),
      });

      if (!response.ok) throw new Error("Error toggling habit");

      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Wrapper pour compatibilité avec l'ancienne API (done: boolean)
  const toggleHabitCompat = async (name: string, done: boolean): Promise<void> => {
    const habit = habits.find(h => h.name === name);
    if (!habit) throw new Error("Habit not found");
    
    let completedLogs = habit.completedLogs || [];
    
    if (done) {
      // done=true : supprimer la dernière entrée
      completedLogs = completedLogs.slice(0, -1);
    } else {
      // done=false : ajouter une nouvelle entrée
      const newLog: CompletedLog = {
        date: new Date().toISOString().split('T')[0],
        status: "completed",
        completedAt: new Date().toISOString(),
        constraints: "" as any
      };
      completedLogs = [...completedLogs, newLog];
    }
    
    await toggleHabit(name, completedLogs);
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
    toggleHabit: toggleHabitCompat,
    deleteHabit,
  };
}
