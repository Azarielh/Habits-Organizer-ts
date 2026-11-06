import { useState } from "react";
import type { AddHabit, Frequency } from "../../lib/type";

interface AddHabitFormProps {
  onHabitAdded?: () => Promise<void>;
  addHabitFn?: (habit: AddHabit) => Promise<void>;
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
	const [allowExtraIterations, setAllowExtraIterations] = useState(false);
  const [iterationInterval, setIterationInterval] = useState(1);
  const [lateIterationPolicy, setLateIterationPolicy] = useState<"spread" | "respect" | "">("");
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

  const usesIterationInterval = iterations > 1 && frequencyType !== "daily" && frequencyType !== "custom";
  const intervalUnit = ["weekend", "semaine", "quinzaine"].includes(frequencyType)
    ? "jour(s)"
    : frequencyType === "mois" ? "semaine(s)" : "mois";

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

      if (usesIterationInterval && !lateIterationPolicy) {
        setError("Choisis comment gérer les réalisations restantes quand l’intervalle ne permet plus de toutes les faire.");
        setLoading(false);
        return;
      }

      const newHabit: AddHabit = {
        name,
        frequency,
        iteration: iterations,
		allowExtraIterations,
		...(usesIterationInterval ? { iterationInterval, lateIterationPolicy: lateIterationPolicy as "spread" | "respect" } : {}),
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
		setAllowExtraIterations(false);
      setIterationInterval(1);
      setLateIterationPolicy("");
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
		<div className="flex flex-wrap items-center gap-4">
			<input type="number" min="1" value={iterations} onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))} className="w-28 rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="1" />
			<label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={allowExtraIterations} onChange={(e) => setAllowExtraIterations(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" />Autoriser des répétitions supplémentaires</label>
		</div>
      </div>

      {usesIterationInterval && (
        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Intervalle souhaité entre les réalisations</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={iterationInterval}
                onChange={(event) => setIterationInterval(Math.max(1, parseInt(event.target.value) || 1))}
                className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">{intervalUnit}</span>
            </div>
          </div>
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-semibold text-slate-700">Si le temps restant ne permet plus de réaliser toutes les itérations en respectant l’intervalle choisi, que faire ?</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <input type="radio" name="lateIterationPolicy" value="spread" required checked={lateIterationPolicy === "spread"} onChange={() => setLateIterationPolicy("spread")} className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <span>Réduire l’intervalle pour répartir les réalisations restantes sur la période</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <input type="radio" name="lateIterationPolicy" value="respect" required checked={lateIterationPolicy === "respect"} onChange={() => setLateIterationPolicy("respect")} className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500" />
	              <span>Respecter l’intervalle : les itérations qui ne tiennent plus dans la période seront signalées comme manquées dans la revue</span>
            </label>
          </fieldset>
        </div>
      )}

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
