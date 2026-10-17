import { useMemo } from "react";
import type { Habit, ToggleHabit } from "../lib/type";
import { getCompletionsForCurrentPeriod, getCompletionsThisWeek, getHabitPeriodKey, getNextIterationIndex, isHabitForToday } from "../../habits";
import { useHabitDate } from "../hooks/useHabitDate";
import TodayIterationCheckbox from "./TodayIterationCheckbox";
import { getFrequencyLabel, getTimeLabel } from "@/lib/presentation";

interface TodayPageProps {
	habits: Habit[];
	loading: boolean;
	error: string;
	onToggleHabit: (payload: ToggleHabit) => Promise<void>;
}

export default function TodayPage({ habits, loading, error, onToggleHabit }: TodayPageProps) {
	const habitDate = useHabitDate();
	const todayHabits = useMemo(() => habits.filter((habit) => {
		if (!isHabitForToday(habit)) return false;
		const periodKey = getHabitPeriodKey(habit, habitDate);
		return getNextIterationIndex(habit, periodKey) !== null;
	}), [habits, habitDate]);
	const todayLabel = new Date(`${habitDate}T12:00:00`).toLocaleDateString("fr-FR", {
		weekday: "long", year: "numeric", month: "long", day: "numeric",
	});

	if (loading) return <div className="py-8 text-center">Chargement...</div>;
	if (error) return <div className="py-8 text-center text-red-500">{error}</div>;

	return (
		<div className="space-y-6">
			<div className="border-b border-slate-200 pb-4">
				<h2 className="mb-1 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">📅 Aujourd'hui</h2>
				<p className="text-lg capitalize text-slate-600">{todayLabel}</p>
			</div>

			{todayHabits.length === 0 ? (
				<div className="rounded-lg border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 py-16 text-center shadow-sm">
					<p className="text-lg font-bold text-emerald-700">Rien de prévu aujourd'hui</p>
					<p className="mb-3 text-4xl">🌿</p>
					<p className="mt-1 text-emerald-700">Tu peux revenir quand tu veux.</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<p className="font-bold text-blue-900">🎯 {todayHabits.length} habitude{todayHabits.length > 1 ? "s" : ""} prévue{todayHabits.length > 1 ? "s" : ""}</p>
					</div>
					{todayHabits.map((habit) => (
						(() => {
							const periodKey = getHabitPeriodKey(habit, habitDate);
							const iterationIndex = getNextIterationIndex(habit, periodKey) ?? 0;
							return (
								<div key={habit.name} className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
									<TodayIterationCheckbox
										iterationNumber={iterationIndex + 1}
										onComplete={() => onToggleHabit({ name: habit.name, habitDate, periodKey, iterationIndex, isChecked: true })}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-baseline gap-3">
											<h3 className="text-lg font-semibold text-slate-800">{habit.name}</h3>
											{habit.description && <p className="text-sm italic text-slate-600">{habit.description}</p>}
										</div>
										<div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
											<span className="font-medium">{habit.iteration > 1 ? `${habit.iteration}× ` : ""}{getFrequencyLabel(habit.frequency)}</span>
											{habit.time && <span className="text-slate-500">• {getTimeLabel(habit.time)}</span>}
										</div>
									</div>
									<div className="flex shrink-0 gap-2">
										<div className="rounded-lg border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2 text-center">
											<div className="text-xs font-medium text-slate-500">Dans la période</div>
											<div className="text-2xl font-bold text-emerald-600">{getCompletionsForCurrentPeriod(habit, habitDate)}/{habit.iteration}</div>
										</div>
										<div className="rounded-lg border border-blue-100 bg-linear-to-br from-blue-50 to-cyan-50 p-3 text-center">
											<div className="text-xl font-bold text-blue-600">{getCompletionsThisWeek(habit)}</div>
											<p className="mt-1 text-xs text-slate-600">Cette semaine</p>
										</div>
									</div>
								</div>
							);
						})()
					))}
				</div>
			)}
		</div>
	);
}
