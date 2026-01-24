import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Habit } from "../../habits";
import { isHabitForToday, getCompletionsThisWeek, getCompletionsToday, isCompletedToday } from "../../habits";

interface TodayPageProps {
  habits: Habit[];
  loading: boolean;
  error: string;
  onToggleHabit: (name: string, completedLogs: Object[]) => Promise<void>;
}

export default function TodayPage({ habits, loading, error, onToggleHabit }: TodayPageProps) {
  // Filter habits for today that are not fully completed today
  const todayHabits = useMemo(
    () => habits.filter((h) => {
      if (!isHabitForToday(h)) return false;
      
      // For habits with iterations, check if all iterations are completed
      const iterations = h.iteration || 1;
      const completionsToday = getCompletionsToday(h);
      
      // Show habit if completions < required iterations
      return completionsToday < iterations;
    }),
    [habits]
  );

  const todayFormatted = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getFrequencyLabel = (frequency: any): string => {
    if (typeof frequency === "string") {
      const labels: Record<string, string> = {
        quotidien: "Quotidien",
        daily: "daily",
        weekend: "Weekend",
        semaine: "Chaque semaine",
        quinzaine: "Chaque quinzaine",
        mois: "Chaque mois",
        semestre: "Chaque semestre",
        an: "Chaque an",
      };
      return labels[frequency] || frequency;
    }

    if (frequency.type === "custom") {
      const dayLabels: Record<string, string> = {
        monday: "Lun",
        tuesday: "Mar",
        wednesday: "Mer",
        thursday: "Jeu",
        friday: "Ven",
        saturday: "Sam",
        sunday: "Dim",
      };
      return frequency.days.map((d: string) => dayLabels[d]).join(", ");
    }

    return "Non défini";
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">📅 Aujourd'hui</h2>
        <p className="text-slate-600 capitalize text-lg">{todayFormatted}</p>
      </div>

      {todayHabits.length === 0 ? (
        <div className="text-center py-16 bg-linear-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 shadow-sm">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg text-emerald-700 font-bold">Parfait !</p>
          <p className="text-emerald-600 mt-1">Toutes tes habitudes d'aujourd'hui sont complétées !</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-bold">
              🎯 {todayHabits.length} habitude{todayHabits.length > 1 ? "s" : ""} à faire
            </p>
          </div>
          {todayHabits.map((habit) => (
            <div 
              key={habit.name}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              {/* Left - Checkbox */}
              <input
                type="checkbox"
                id={`today-habit-${habit.name}`}
                checked={isCompletedToday(habit)}
                onChange={() => onToggleHabit(habit.name, habit.completedLogs || [])}
                className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />

              {/* Center - Habit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg text-slate-800">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-slate-600 italic">{habit.description}</p>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-sm text-slate-600 flex-wrap">
                  <span className="font-medium">{habit.iteration > 1 ? `${habit.iteration}x ` : ""}{getFrequencyLabel(habit.frequency)}</span>
                  {habit.time && (
                    <span className="text-slate-500">
                      • {habit.time === "morning"
                        ? "🌅 Matin"
                        : habit.time === "afternoon"
                          ? "☀️ Après-midi"
                          : "🌙 Soir"}
                    </span>
                  )}
                </div>
              </div>

              {/* Right - Displaying Streak */}
              <div className="flex gap-2 shrink-0">
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border border-emerald-200 text-center">
                  <div className="text-xs text-slate-500 font-medium">Aujourd'hui</div>
                  <div className="text-2xl font-bold text-emerald-600">{getCompletionsToday(habit)}/{habit.iteration}</div>
                </div>
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100 text-center">
                  <div className="text-xl font-bold text-blue-600">{getCompletionsThisWeek(habit)}</div>
                  <p className="text-xs text-slate-600 mt-1">Cette semaine</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
