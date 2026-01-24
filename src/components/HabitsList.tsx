import type { Habit } from "../../habits";
import { getCompletionsThisWeek, getCompletionsToday, getExpectedCompletionsThisWeek } from "../../habits";

interface HabitsListProps {
  habits: Habit[];
  loading: boolean;
  error: string;
  onToggleHabit: (name: string, done: boolean) => Promise<void>;
  onDeleteHabit: (name: string) => Promise<void>;
}

export default function HabitsList({ habits, loading, error, onToggleHabit, onDeleteHabit }: HabitsListProps) {
  const deleteHabitHandler = async (name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      await onDeleteHabit(name);
    } catch (err) {
      console.error(err);
    }
  };

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
        "3x/week": "3x par semaine",
        weekly: "Hebdomadaire",
        monthly: "Mensuel",
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
    <div className="space-y-4">
      <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">🎯 Mes Habitudes</h2>
      {habits.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">Aucune habitude pour le moment. Crée ta première ! 🚀</div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const completionsToday = getCompletionsToday(habit);
            const needsMoreCompletions = completionsToday < habit.iteration;
            
            // Create blocks: N crossed-out blocks + 1 empty block if needed
            const blocks: { id: any; completed: any; }[] = [];
            for (let i = 0; i < completionsToday; i++) {
              blocks.push({ id: `${habit.name}-completed-${i}`, completed: true });
            }
            if (needsMoreCompletions) {
              blocks.push({ id: `${habit.name}-empty`, completed: false });
            }
            
            return (
              <div key={habit.name}>
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all mb-2 ${
                      block.completed
                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                        : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Left - Checkbox */}
                    <input
                      type="checkbox"
                      id={block.id}
                      checked={block.completed}
                      onChange={() => onToggleHabit(habit.name, block.completed)}
                      className={`w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500`}
                    />

                    {/* Center - Habit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className={`font-semibold text-lg ${block.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-sm text-slate-600 italic">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex gap-3 mt-2 text-sm text-slate-600 flex-wrap">
                        <span className="font-medium">{habit.iteration > 1 ? `${habit.iteration}x ` : ""}{getFrequencyLabel(habit.frequency)}</span>
                        {habit.time && (
                          <span className="text-slate-500">
                            • {habit.time === "morning" ? "🌅 Matin" : habit.time === "afternoon" ? "☀️ Après-midi" : "🌙 Soir"}
                          </span>
                        )}
                        {habit.createdAt && (
                          <span className="text-slate-500">• Créé le {new Date(habit.createdAt).toLocaleDateString("fr-FR")}</span>
                        )}
                      </div>
                    </div>

                    {/* Right - Stats (only on first block) */}
                    {blocks.indexOf(block) === 0 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-linear-to-br from-blue-50 to-cyan-50 px-3 py-2 rounded-lg border border-blue-100 text-center">
                          <div className="text-xs text-slate-500 font-medium">Semaine</div>
                          <div className="font-bold text-blue-600 text-lg">{getCompletionsThisWeek(habit)}/{Math.round(getExpectedCompletionsThisWeek(habit))}</div>
                        </div>
                        {habit.currentStreak !== undefined && (
                          <div className="bg-linear-to-br from-purple-50 to-pink-50 px-3 py-2 rounded-lg border border-purple-100 text-center">
                            <div className="text-xs text-slate-500 font-medium">Streak</div>
                            <div className="font-bold text-purple-600 text-lg">{habit.currentStreak}</div>
                          </div>
                        )}
                        {habit.totalCompleted !== undefined && (
                          <div className="bg-linear-to-br from-emerald-50 to-teal-50 px-3 py-2 rounded-lg border border-emerald-100 text-center">
                            <div className="text-xs text-slate-500 font-medium">Total</div>
                            <div className="font-bold text-emerald-600 text-lg">{habit.totalCompleted}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Right - Delete Button (only on first block) */}
                    {blocks.indexOf(block) === 0 && (
                      <button
                        onClick={() => deleteHabitHandler(habit.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Supprimer cette habitude"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
