import type { Habit } from "./habits";
import { type habitsLogs, type AddHabit, type DeleteHabit } from "./src/lib/type";
import {
  addHabit,
  toggleHabitDone,
  deleteHabit,
  getHabitByName,
  habits,
} from "./habits";

function payload_is(body: any): any {
  if (body.hasOwnProperty('name') && body.hasOwnProperty('completedLogs')) {
    const payload = body as habitsLogs;
    return payload;
  }
  if (body.hasOwnProperty('name')) {
    const payload = body as DeleteHabit;
    return payload;
  }
  if (body.hasOwnProperty('habits')) {
    const payload = body as AddHabit;
    return payload;
  }
  return null;
}

export function routeInteraction(habits: Habit[], body: object) {
  console.log("Routing interaction with body:", body);
	return true; 
}