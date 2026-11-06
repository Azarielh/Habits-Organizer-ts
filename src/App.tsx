import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "./hooks/useHabits";
import AddHabitForm from "./components/ui/AddHabitForm";
import HabitsList from "./components/HabitsListPage";
import TodayPage from "./components/TodayPage";
import StatsPage from "./components/StatsPage";
import ReviewPage from "./components/ReviewPage";
import "../styles/index.css";

export function App() {
  const [showForm, setShowForm] = useState(false);
  const [currentTab, setCurrentTab] = useState<"today" | "habits" | "stats" | "review">("today");
  const [darkTheme, setDarkTheme] = useState(() => {
    try {
      return window.localStorage.getItem("habits-organizer-theme") === "dark";
    } catch {
      return false;
    }
  });
  
  const { habits, loading, error, addHabit, toggleHabit, reviewHabit, deleteHabit } = useHabits();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkTheme);
    document.documentElement.style.colorScheme = darkTheme ? "dark" : "light";
    try {
      window.localStorage.setItem("habits-organizer-theme", darkTheme ? "dark" : "light");
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }
  }, [darkTheme]);

  const handleHabitAdded = async () => {
    setShowForm(false);
  };

  return (
    <div data-app-shell className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 gap-8">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setDarkTheme((current) => !current)}
              aria-label={darkTheme ? "Activer le thème clair" : "Activer le thème sombre"}
              aria-pressed={darkTheme}
              title={darkTheme ? "Passer au thème clair" : "Passer au thème sombre"}
              className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-300/70 bg-white/70 text-lg text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {darkTheme ? "☀️" : "🌙"}
            </button>
            <div className="flex items-center gap-3">
              <img src="./logo.svg" alt="" className="h-14 w-14 shrink-0" />
              <div>
                <h1 className="mb-1 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">
                  Habits Organizer
                </h1>
                <p className="text-slate-500">Suivez vos habitudes, avancez à votre rythme.</p>
              </div>
            </div>
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
			<button onClick={() => setCurrentTab("review")} className={`rounded-md px-4 py-2 font-medium transition-all ${currentTab === "review" ? "bg-blue-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>
				📝 Revue
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
        ) : currentTab === "review" ? (
			<ReviewPage habits={habits} loading={loading} error={error} onReview={reviewHabit} />
		) : (
          <StatsPage habits={habits} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
}

export default App;
