import { serve } from "bun";
import index from "./index.html";
import type { Habit } from "../habits.ts";
import { routeInteraction } from "../interaction_router.ts";

// Load habits from JSON file
let habits: Habit[] = [];

async function loadHabits() {
  try {
    const file = Bun.file("habits-data.json");
    const buffer = await file.arrayBuffer();
    
    // Nettoyer le JSON : corriger les virgules traînantes
    let content = new TextDecoder("utf-8").decode(buffer);
    content = content.replace(/,(\s*[}\]])/g, "$1");
    
    const data = JSON.parse(content);
    habits = data.habits || [];
    console.log("✅ Habits loaded from habits-data.json");
  } catch (error) {
    console.error("❌ Error loading:", error);
    habits = [];
  }
}

async function saveHabits() {
  try {
    await Bun.write("habits-data.json", JSON.stringify({ habits }, null, 2));
    console.log("💾 Habits saved");
  } catch (error) {
    console.error("❌ Error saving:", error);
  }
}

// Load habits on startup
await loadHabits();

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
          
          const result = await routeInteraction(habits, body);
          habits = result;
          
          await saveHabits();
          
          return Response.json(habits);
        } catch (error) {
          console.error("❌ POST /api/habitsorganizer error:", error);
          return Response.json({ error: "Server error" }, { status: 400 });
        }
      }
    },

    // Serve index.html for all unmatched routes
    "/*": index,
  },
});

console.log(`🚀 Server running at http://0.0.0.0:${server.port}`);
