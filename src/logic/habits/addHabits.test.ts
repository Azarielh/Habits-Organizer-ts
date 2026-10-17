import { describe, expect, test } from "bun:test";
import { addHabits } from "./addHabits";
import type { AddHabit } from "../../lib/type";

const draft: AddHabit = {
	name: "Lecture",
	frequency: "daily",
	iteration: 3,
	time: "",
};

describe("addHabits", () => {
	test("stores the requested iteration count in the canonical field", () => {
		const [created] = addHabits(draft, []);
		expect(created?.iteration).toBe(3);
		expect(created?.completedLogs).toEqual([]);
	});

	test("rejects names that would make checkbox actions ambiguous", () => {
		expect(() => addHabits({ ...draft, name: " lecture " }, [addHabits(draft, [])[0]!])).toThrow();
	});
});
