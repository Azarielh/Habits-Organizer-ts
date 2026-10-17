import { serve } from "bun";
import index from "./index.html";
import type { Habit } from "../habits.ts";
import { routeInteraction } from "../interaction_router.ts";

// Load habits from JSON file
let habits: Habit[] = [];

async function loadHabits() {
  try {
    const file = Bun.file("habits-data.json");
    if (!(await file.exists())) {
      habits = [];
      return;
    }
    const buffer = await file.arrayBuffer();
    
    // Nettoyer le JSON : corriger les virgules traînantes
    let content = new TextDecoder("utf-8").decode(buffer);
    content = content.replace(/,(\s*[}\]])/g, "$1");
    
    const data: unknown = JSON.parse(content);
    if (!data || typeof data !== "object" || !Array.isArray((data as { habits?: unknown }).habits)) {
      throw new Error("habits-data.json must contain a habits array");
    }
    habits = (data as { habits: Habit[] }).habits;
    console.log("✅ Habits loaded from habits-data.json");
  } catch (error) {
    console.error("❌ Error loading:", error);
    throw error;
  }
}

async function saveHabits(nextHabits: Habit[]) {
	await Bun.write("habits-data.json", JSON.stringify({ habits: nextHabits }, null, 2));
	console.log("💾 Habits saved");
}

// Load habits on startup
await loadHabits();

let mutationQueue: Promise<void> = Promise.resolve();

const server = serve({
  port: 3001,
  hostname: "0.0.0.0",
  routes: {
    "/api/habitsorganizer": {
      async GET(req) {
        return Response.json(habits);
      },
      async POST(req) {
        try {
          const contentType = req.headers.get("content-type");
          console.log("POST /api/habitsorganizer - Content-Type:", contentType);
          
          if (!contentType?.includes("application/json")) {
            return Response.json({ error: "Content-Type must be application/json" }, { status: 400 });
          }

          const body = await req.json();
          console.log("📥 POST /api/habitsorganizer received:");
          
          const update = async () => {
            const nextHabits = await routeInteraction(habits, body);
            await saveHabits(nextHabits);
            habits = nextHabits;
            return Response.json(habits);
          };
          const pending = mutationQueue.then(update, update);
          mutationQueue = pending.then(() => undefined, () => undefined);
          return await pending;
        } catch (error) {
          console.error("❌ POST /api/habitsorganizer error:", error);
          const message = error instanceof Error ? error.message : "Server error";
          const status = message === "Invalid habit request" || message.startsWith("Habit not found")
            || message.startsWith("Invalid repetition") || message.startsWith("Une habitude") ? 400 : 500;
          return Response.json({ error: message }, { status });
        }
      }
    },

    // Serve index.html for all unmatched routes
    "/*": index,
  },
});

console.log(`🚀 Server running at http://0.0.0.0:${server.port}`);
