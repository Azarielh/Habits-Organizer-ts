import { describe, expect, test } from "bun:test";
import { routeInteraction } from "./interaction_router";

describe("habit request routing", () => {
	test("creates, checks, and deletes a habit through the shared endpoint payloads", async () => {
		let habits = await routeInteraction([], {
			name: "Méditation", frequency: "daily", iteration: 2, time: "morning",
		});
		expect(habits).toHaveLength(1);
		expect(habits[0]?.iteration).toBe(2);

		habits = await routeInteraction(habits, {
			name: "Méditation", habitDate: "2026-10-17", periodKey: "2026-10-17", iterationIndex: 0, isChecked: true,
		});
		expect(habits[0]?.completedLogs).toHaveLength(1);
		expect(habits[0]?.completedLogs[0]?.iterationIndex).toBe(0);

		habits = await routeInteraction(habits, { name: "Méditation" });
		expect(habits).toHaveLength(0);
	});

	test("rejects unknown payloads instead of silently returning unchanged data", async () => {
		await expect(routeInteraction([], {})).rejects.toThrow("Invalid habit request");
		await expect(routeInteraction([], { name: "Missing", habitDate: "2026-10-17", periodKey: "2026-10-17", iterationIndex: 0, isChecked: true })).rejects.toThrow("Habit not found");
	});
});
