import type { Habit, AddHabit, DeleteHabit, ToggleHabit } from "./src/lib/type";
import { isAddHabitPayload, isDeleteHabitPayload, isReviewHabitPayload, isToggleHabitPayload } from "./src/lib/type";
import { handleToggleHabit } from "./src/lib/logs_manager";
import { applyReview } from "./src/lib/review_manager";
import { addHabits } from "@/logic/habits/addHabits";
import { deleteHabit } from "@/logic/habits/deleteHabit";

export async function routeInteraction(habits: Habit[], body: unknown): Promise<Habit[]> {
  
  const payload = body;
	if (isReviewHabitPayload(payload)) return applyReview(payload, habits);
  
  if (isToggleHabitPayload(payload)) {
    return await handleToggleHabit(payload as ToggleHabit, habits);
  }

  // AddHabit: name + habits (array)
  if (isAddHabitPayload(payload)) {
    return await addHabits(payload as AddHabit, habits);
  }

  // DeleteHabit: seulement name, pas d'autres champs
  if (isDeleteHabitPayload(payload)) {
    const matches = habits.filter((habit) => habit.name === payload.name);
    if (matches.length !== 1) throw new Error("Habit not found or name is ambiguous");
    return await deleteHabit(payload as DeleteHabit, habits);
  }

  throw new Error("Invalid habit request");
}
