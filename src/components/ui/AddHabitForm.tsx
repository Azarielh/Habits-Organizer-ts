import { useState } from "react";
import type { Habit, Frequency } from "../../../habits";

interface AddHabitFormProps {
  onHabitAdded?: () => Promise<void>;
  addHabitFn?: (habit: Habit) => Promise<void>;
}

const DAYS = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

const FREQUENCIES = [
  { value: "daily", label: "daily" },
  { value: "weekend", label: "Weekend" },
  { value: "semaine", label: "Chaque semaine" },
  { value: "quinzaine", label: "Chaque quinzaine" },
  { value: "mois", label: "Chaque mois" },
  { value: "semestre", label: "Chaque semestre" },
  { value: "an", label: "Chaque an" },
  { value: "custom", label: "Personnalisé" },
];

export default function AddHabitForm({ onHabitAdded, addHabitFn }: AddHabitFormProps) {
  const [name, setName] = useState("");
  const [frequencyType, setFrequencyType] = useState<string>("daily");
  const [iterations, setIterations] = useState<number>(1);
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [time, setTime] = useState<"morning" | "afternoon" | "evening" | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDayToggle = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let frequency: Frequency;

      if (frequencyType === "custom") {
        if (customDays.length === 0) {
          setError("Sélectionne au moins un jour");
          setLoading(false);
          return;
        }
        frequency = {
          type: "custom",
          days: customDays as any,
        };
      } else {
        frequency = frequencyType as Frequency;
      }

      const newHabit: Habit = {
        name,
        frequency,
        iterations,
        time,
        description,
      };

      if (addHabitFn) {
        await addHabitFn(newHabit);
      }

      // Reset the form
      setName("");
      setFrequencyType("daily");
      setIterations(1);
      setCustomDays([]);
      setTime("");
      setDescription("");

      if (onHabitAdded) {
        await onHabitAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de l'habitude</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Ex: Méditation"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Fréquence</label>
        <select
          value={frequencyType}
          onChange={(e) => {
            setFrequencyType(e.target.value);
            if (e.target.value !== "custom") {
              setCustomDays([]);
            }
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          {FREQUENCIES.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Itérations (nombre de fois)</label>
        <input
          type="number"
          min="1"
          value={iterations}
          onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="1"
        />
      </div>

      {frequencyType === "custom" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Jours</label>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map((day) => (
              <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customDays.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Moment de la journée</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value as any)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="">Aucun</option>
          <option value="morning">🌅 Matin</option>
          <option value="afternoon">☀️ Après-midi</option>
          <option value="evening">🌙 Soir</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Description ({description.length}/150)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 150))}
          maxLength={150}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          placeholder="Ex: Session de 7 postures, une par chakra"
          rows={2}
        />
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-400 disabled:to-slate-400 text-white py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        {loading ? "Création..." : "✨ Créer l'habitude"}
      </button>
    </form>
  );
}
