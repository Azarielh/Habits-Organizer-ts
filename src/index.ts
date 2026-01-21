import { serve } from "bun";
import index from "./index.html";
import { addHabit, toggleHabitDone, getHabitByName, deleteHabit, type Habit } from "../habits.ts";
import { routeInteraction } from "../interaction_router.ts";

// Load habits from JSON file
let habits: Habit[] = [];

async function loadHabits() {
  try {
    const file = Bun.file("habits-data.json");
    const content = await file.text();
    const data = JSON.parse(content);
    habits = data.habits;
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
    "/api/habits": {
      async GET(req) {
        return Response.json(habits);
      },
      async POST(req) {
        try {
          const contentType = req.headers.get("content-type");
          console.log("POST /api/habits - Content-Type:", contentType);
          
          if (!contentType?.includes("application/json")) {
            return Response.json({ error: "Content-Type must be application/json" }, { status: 400 });
          }

          const body = await req.json();
          console.log("Received body:", body);
          const result = routeInteraction( habits, { args: body });

          const newHabit: Habit = body;
          const updatedHabits = addHabit(habits, newHabit);
          habits = updatedHabits;
          
          await saveHabits();
          
          return Response.json(updatedHabits, { status: 201 });
        } catch (error) {
          console.error("POST error:", error);
          return Response.json({ error: "Invalid JSON or server error" }, { status: 400 });
        }
      }
    },

    "/api/do-habit": {
      async POST(req) {
        try {
          const body = await req.json();
          const { name, done } = body;
          const result = routeInteraction( habits, { args: body });

          if (!name || typeof done !== "boolean") {
            return Response.json({ error: "name and done required" }, { status: 400 });
          }

          const habit = getHabitByName(habits, name);
          if (!habit) {
            return Response.json({ error: `Habit "${name}" not found` }, { status: 404 });
          }

          habits = toggleHabitDone(habits, name, done);
          await saveHabits();
          console.log(`✅ Habit "${name}" toggled to done=${done}`);

          return Response.json(habits);
        } catch (error) {
          console.error("POST /api/do-habit error:", error);
          return Response.json({ error: "Server error" }, { status: 400 });
        }
      }
    },

    "/api/delete-habit": {
      async POST(req) {
        try {
          const body = await req.json();
          const { name } = body;
          const result = routeInteraction(habits, { args: body });

          if (!name) {
            return Response.json({ error: "name required" }, { status: 400 });
          }

          const habit = getHabitByName(habits, name);
          if (!habit) {
            return Response.json({ error: `Habit "${name}" not found` }, { status: 404 });
          }

          habits = deleteHabit(habits, name);
          await saveHabits();
          console.log(`🗑️ Habit "${name}" deleted`);

          return Response.json(habits);
        } catch (error) {
          console.error("POST /api/delete-habit error:", error);
          return Response.json({ error: "Server error" }, { status: 400 });
        }
      }
    },

    "/api/habits/command": {
      async POST(req) {
        try {
          const body = await req.json();
          const result = routeInteraction( habits, { args: body });
          return Response.json(result);
        } catch (error) {
          console.error("POST /api/habits/command error:", error);
          return Response.json({ error: "Server error" }, { status: 400 });
        }
      }
    },

    // Serve index.html for all unmatched routes
    "/*": index,
  },
});

console.log(`🚀 Server running at http://0.0.0.0:${server.port}`);
