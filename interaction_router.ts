import type { Habit } from "./habits";
import {
  addHabit,
  toggleHabitDone,
  deleteHabit,
  getHabitByName,
} from "./habits";

function type_check_body(body: any): string {
  if (body.hasOwnProperty('name') && body.hasOwnProperty('done')) {
    return "toggle-habit";

export function routeInteraction(habits: Habit[], body: object) {
	//if request is 
}

