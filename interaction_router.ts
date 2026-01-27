import type { Habit, AddHabit, DeleteHabit, ToggleHabit } from "./src/lib/type";
import { isAddHabitPayload, isDeleteHabitPayload, isToggleHabitPayload } from "./src/lib/type";
import { handleToggleHabit } from "./src/lib/logs_manager";
import { addHabits } from "@/logic/habits/addHabits";
import { deleteHabit } from "@/logic/habits/deleteHabit";

export async function routeInteraction(habits: Habit[], body: any): Promise<Habit[]> {
  
  const payload = body;
  console.log("payload:", payload);
  
  if (isToggleHabitPayload(payload)) {
    console.log("🔄 Route vers handleToggleHabit");
    return await handleToggleHabit(payload as ToggleHabit, habits);
  }

  // AddHabit: name + habits (array)
  if (isAddHabitPayload(payload)) {
    console.log("🔄 Route vers addHabits");
    return await addHabits(payload as AddHabit, habits);
  }

  // DeleteHabit: seulement name, pas d'autres champs
  if (isDeleteHabitPayload(payload)) {
    console.log("🔄 Route vers deleteHabit");
    return await deleteHabit(payload as DeleteHabit, habits);
  }

  console.warn("⚠️ Type non reconnu");
  return habits;
}