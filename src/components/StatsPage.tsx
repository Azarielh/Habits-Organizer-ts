import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Habit } from "../../habits";
import { getCompletionsThisWeek, getGlobalCompletionRate, getExpectedCompletionsThisWeek, getWeightedGlobalCompletionRate } from "../../habits";

interface StatsPageProps {
  habits: Habit[];
  loading: boolean;
  error: string;
}

export default function StatsPage({ habits, loading, error }: StatsPageProps) {
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

  // Calcul des stats globales
  const totalHabits = habits.length;
  const avgStreak = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0) / habits.length)
    : 0;
  
  const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompleted || 0), 0);
  
  // Weighted average completion rate (accounts for effort of each habit)
  const avgCompletion = getWeightedGlobalCompletionRate(habits);

  if (loading) return <div className="text-center py-8 text-slate-500">Chargement...</div>;
  if (error) return <div className="text-red-600 text-center py-8 bg-red-50 rounded-lg p-4">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">📊 Statistiques</h2>
        <p className="text-slate-600">Suivi de tes progrès</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-600 mb-2">🎯 Total d'habitudes</div>
          <div className="text-4xl font-bold text-blue-600">{totalHabits}</div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-600 mb-2">🔥 Streak moyen</div>
          <div className="text-4xl font-bold text-purple-600">{avgStreak}</div>
          <p className="text-xs text-slate-600 mt-1">jours</p>
        </div>

        <div className="bg-linear-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-600 mb-2">✨ Taux de complétion</div>
          <div className="text-4xl font-bold text-emerald-600">{avgCompletion}%</div>
        </div>

        <div className="bg-linear-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-600 mb-2">⭐ Total réalisations</div>
          <div className="text-4xl font-bold text-cyan-600">{totalCompletions}</div>
        </div>
      </div>

      {/* Per-Habit Stats */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-slate-800">📈 Détail par habitude</h3>
        {habits.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            Aucune habitude pour afficher les statistiques
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const weekCompletions = getCompletionsThisWeek(habit);
              const expectedWeekCompletions = getExpectedCompletionsThisWeek(habit);
              const weekCompletionRate = expectedWeekCompletions > 0 
                ? Math.round((weekCompletions / expectedWeekCompletions) * 100)
                : 0;
              const globalCompletionRate = getGlobalCompletionRate(habit);
              
              return (
                <div key={habit.name} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h4 className="font-bold text-lg text-slate-800">{habit.name}</h4>
                        {habit.description && (
                          <p className="text-sm text-slate-600 italic">{habit.description}</p>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        {habit.iteration}x {getFrequencyLabel(habit.frequency)}
                      </p>
                      {habit.createdAt && (
                        <p className="text-xs text-slate-500 mt-1">Créé le {new Date(habit.createdAt).toLocaleDateString("fr-FR")}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="text-right bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border border-emerald-200">
                        <div className="text-sm font-semibold text-slate-600">Cette semaine</div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {weekCompletionRate}%
                        </div>
                      </div>
                      <div className="text-right bg-linear-to-br from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border border-blue-200">
                        <div className="text-sm font-semibold text-slate-600">Global</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {globalCompletionRate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar - This week */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 mb-1">Cette semaine</p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(weekCompletionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress bar - Global */}
                  <div className="mb-6">
                    <p className="text-xs text-slate-600 mb-1">Taux global</p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(globalCompletionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100 text-center">
                      <div className="text-xl font-bold text-blue-600">{habit.currentStreak || 0}</div>
                      <p className="text-xs text-slate-600 mt-1">Streak actuel</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100 text-center">
                      <div className="text-xl font-bold text-purple-600">{habit.longestStreak || 0}</div>
                      <p className="text-xs text-slate-600 mt-1">Meilleur streak</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100 text-center">
                      <div className="text-xl font-bold text-emerald-600">{habit.totalCompleted || 0}</div>
                      <p className="text-xs text-slate-600 mt-1">Total réalisé</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
