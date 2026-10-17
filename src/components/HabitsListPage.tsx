import type { Habit, ToggleHabit } from "../lib/type";
import { calculateCurrentStreak, calculateLongestStreak, getCompletionsForCurrentPeriod, getCompletionsThisWeek, getExpectedCompletionsThisWeek, getHabitPeriodKey } from "../../habits";
import { useHabitDate } from "../hooks/useHabitDate";
import CompletionCheckboxes from "./CompletionCheckboxes";
import { getFrequencyLabel, getTimeLabel } from "@/lib/presentation";

interface HabitsListProps {
	habits: Habit[];
	loading: boolean;
	error: string;
	onToggleHabit: (payload: ToggleHabit) => Promise<void>;
	onDeleteHabit: (name: string) => Promise<void>;
}

export default function HabitsList({ habits, loading, error, onToggleHabit, onDeleteHabit }: HabitsListProps) {
	const habitDate = useHabitDate();
	const deleteHabitHandler = async (name: string) => {
		if (!window.confirm(`Êtes-vous sûr de vouloir supprimer « ${name} » ?`)) return;
		try {
			await onDeleteHabit(name);
		} catch (err) {
			console.error(err);
		}
	};

	if (loading) return <div className="py-8 text-center">Chargement...</div>;
	if (error) return <div className="py-8 text-center text-red-500">{error}</div>;

	return (
		<div className="space-y-4">
			<h2 className="mb-6 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent">🎯 Mes habitudes</h2>
			{habits.length === 0 ? (
				<div className="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center text-slate-500">Aucune habitude pour le moment. Crée ta première !</div>
			) : (
				<div className="space-y-3">
					{habits.map((habit) => (
						<div key={habit.name} className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
							<CompletionCheckboxes
								habit={habit}
								periodKey={getHabitPeriodKey(habit, habitDate)}
								onChange={(iterationIndex, isChecked) => onToggleHabit({ name: habit.name, habitDate, periodKey: getHabitPeriodKey(habit, habitDate), iterationIndex, isChecked })}
							/>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-baseline gap-3">
									<h3 className="text-lg font-semibold text-slate-800">{habit.name}</h3>
									{habit.description && <p className="text-sm italic text-slate-600">{habit.description}</p>}
								</div>
								<div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
									<span className="font-medium">{habit.iteration > 1 ? `${habit.iteration}× ` : ""}{getFrequencyLabel(habit.frequency)}</span>
									{habit.time && <span className="text-slate-500">• {getTimeLabel(habit.time)}</span>}
									{habit.createdAt && <span className="text-slate-500">• Créée le {new Date(habit.createdAt).toLocaleDateString("fr-FR")}</span>}
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-center">
									<div className="text-xs font-medium text-slate-500">Cette semaine</div>
									<div className="text-lg font-bold text-blue-600">{getCompletionsThisWeek(habit)}/{Math.round(getExpectedCompletionsThisWeek(habit))}</div>
								</div>
								<div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center">
									<div className="text-xs font-medium text-slate-500">Dans la période</div>
									<div className="text-lg font-bold text-emerald-600">{getCompletionsForCurrentPeriod(habit, habitDate)}/{habit.iteration}</div>
								</div>
								<div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2 text-center">
									<div className="text-xs font-medium text-slate-500">Série</div>
									<div className="text-lg font-bold text-purple-600">{calculateCurrentStreak(habit)}/{calculateLongestStreak(habit)}</div>
								</div>
								<button onClick={() => void deleteHabitHandler(habit.name)} className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50 hover:text-red-700" title="Supprimer cette habitude" aria-label={`Supprimer ${habit.name}`}>🗑️</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
