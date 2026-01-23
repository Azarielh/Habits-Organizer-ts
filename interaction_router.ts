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
  // Extrait les données si elles sont dans args, sinon utilise body directement
  const data = body.args || body;

  if (data.hasOwnProperty('name') && data.hasOwnProperty('completedLogs')) {
    const payload = data as habitsLogs;
    console.log("payload_is detected habitsLogs");
    return payload;
  }
  
  // AddHabit a name + frequency (complet avec tous les champs)
  if (data.hasOwnProperty('name') && data.hasOwnProperty('frequency')) {
    const payload = data as AddHabit;
    console.log("payload_is detected AddHabit");
    return payload;
  }

  // DeleteHabit a seulement name
  if (data.hasOwnProperty('name') && Object.keys(data).length === 1) {
    const payload = data as DeleteHabit;
    console.log("payload_is detected DeleteHabit");
    return payload;
  }
  
  console.log("payload_is could not match any type");
  return null;
}

export function routeInteraction(habits: Habit[], body: any) {
  console.log("interaction_router is here !\n with body:", body);
  const payload = payload_is(body["args"]);
  
  return true; 
}