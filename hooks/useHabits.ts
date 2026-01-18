import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import type { Habit } from "../../habits";

const STORAGE_KEY = "@habits_organizer_mobile";

export function useHabits(apiUrl: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to fetch from API first
      try {
        const response = await axios.get(`${apiUrl}/api/habits`, { timeout: 5000 });
        const data = response.data;
        setHabits(data);
        
        // Save to local storage as fallback
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (networkError) {
        // Fallback to local storage if network fails
        console.log("Network error, trying local storage:", networkError);
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          setHabits(JSON.parse(cached));
          setError("Working offline - using cached data");
        } else {
          setError("No connection and no cached data");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [apiUrl]);

  const addHabit = async (newHabit: Habit): Promise<void> => {
    try {
      const response = await axios.post(`${apiUrl}/api/habits`, newHabit, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const data = response.data;
      setHabits(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding habit");
      throw err;
    }
  };

  const toggleHabit = async (name: string, done: boolean): Promise<void> => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/toggle-habit`,
        { name, done },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const data = response.data;
      setHabits(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error toggling habit");
      throw err;
    }
  };

  const deleteHabit = async (name: string): Promise<void> => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/delete-habit`,
        { name },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const data = response.data;
      setHabits(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting habit");
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
