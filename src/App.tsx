import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "./hooks/useHabits";
import AddHabitForm from "./components/ui/AddHabitForm";
import HabitsList from "./components/HabitsListPage";
import TodayPage from "./components/TodayPage";
import StatsPage from "./components/StatsPage";
import "../styles/index.css";

export function App() {
  console.log("🔵 App component rendering");
  const [showForm, setShowForm] = useState(false);
  const [currentTab, setCurrentTab] = useState<"today" | "habits" | "stats">("today");
  
  console.log("🔵 About to call useHabits");
  const { habits, loading, error, addHabit, toggleHabit, deleteHabit } = useHabits();
  console.log("🔵 useHabits returned:", { habitsCount: habits.length, loading, error });

  const handleHabitAdded = async () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Network Preview Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center">
        <p className="text-amber-800 text-sm font-medium">
          🚀 This tool is just a quick preview. 
          There is no real mobile version yet, but it's intended in the future.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Habit's Organizer
            </h1>
            <p className="text-slate-500">Suivez vos habitudes, atteindre vos objectifs</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1 shrink-0">
            <button
              onClick={() => setCurrentTab("today")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                currentTab === "today"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📅 Aujourd'hui
            </button>
            <button
              onClick={() => setCurrentTab("habits")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                currentTab === "habits"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🎯 Habitudes
            </button>
            <button
              onClick={() => setCurrentTab("stats")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                currentTab === "stats"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📊 Stats
            </button>
          </div>
        </div>

        {currentTab === "today" ? (
          <TodayPage habits={habits} loading={loading} error={error} onToggleHabit={toggleHabit} />
        ) : currentTab === "habits" ? (
          <div className="flex flex-col gap-4">
            {/* New Habit Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              {showForm ? "✕ Annuler" : "➕ Nouvelle habitude"}
            </button>

            {showForm && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-blue-600">Créer une habitude</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddHabitForm onHabitAdded={handleHabitAdded} addHabitFn={addHabit} />
                </CardContent>
              </Card>
            )}

            {/* Habits List */}
            <HabitsList habits={habits} loading={loading} error={error} onToggleHabit={toggleHabit} onDeleteHabit={deleteHabit} />
          </div>
        ) : (
          <StatsPage habits={habits} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
}

export default App;
