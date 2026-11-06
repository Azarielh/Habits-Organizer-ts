import { useEffect, useMemo, useState } from "react";
import type { Habit, ReviewHabit } from "../lib/type";
import { getReviewItems } from "../lib/review_manager";

interface ReviewPageProps {
	habits: Habit[];
	loading: boolean;
	error: string;
	onReview: (payload: ReviewHabit) => Promise<void>;
}

const choices = [
	{ status: "missed" as const, reason: "tired" as const, label: "Fatigué" },
	{ status: "missed" as const, reason: "forgot" as const, label: "Oublié" },
	{ status: "missed" as const, reason: "unmotivated" as const, label: "Pas réussi à me motiver" },
	{ status: "not_applicable" as const, reason: undefined, label: "Non applicable" },
];

export default function ReviewPage({ habits, loading, error, onReview }: ReviewPageProps) {
	const [now, setNow] = useState(() => new Date());
	const [busy, setBusy] = useState<string[]>([]);
	const [actionError, setActionError] = useState("");
	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 30_000);
		return () => window.clearInterval(timer);
	}, []);
	const items = useMemo(() => getReviewItems(habits, now), [habits, now]);

	const save = async (item: (typeof items)[number], status: ReviewHabit["status"], reason?: ReviewHabit["reason"]) => {
		const key = `${item.habit.name}:${item.periodKey}:${item.iterationIndex}`;
		setBusy((current) => [...current, key]);
		setActionError("");
		try {
			await onReview({ action: "review", name: item.habit.name, habitDate: item.habitDate, periodKey: item.periodKey, iterationIndex: item.iterationIndex, status, ...(reason ? { reason } : {}) });
		} catch {
			setActionError("La mise à jour n’a pas pu être enregistrée. Réessaie.");
		} finally {
			setBusy((current) => current.filter((value) => value !== key));
		}
	};

	if (loading) return <div className="py-8 text-center">Chargement...</div>;
	if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
	return <div className="space-y-6">
		<div className="border-b border-slate-200 pb-4">
			<h2 className="mb-1 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">📝 Revue</h2>
			<p className="text-slate-600">Les répétitions à revoir restent disponibles de 20 h à 20 h le lendemain.</p>
		</div>
		{actionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
		{items.length === 0 ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 py-12 text-center text-emerald-800">Aucune répétition à revoir pour le moment.</div> :
			<div className="space-y-4">{items.map((item) => {
				const key = `${item.habit.name}:${item.periodKey}:${item.iterationIndex}`;
				const selected = item.status === "not_applicable" ? "not_applicable" : item.reason;
				return <article key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="mb-4">
						<h3 className="text-lg font-semibold text-slate-800">{item.habit.name} <span className="text-sm font-normal text-slate-500">— répétition {item.iterationIndex + 1}</span></h3>
						<p className="mt-1 text-sm text-slate-500">{new Date(`${item.habitDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
					</div>
					<div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
						{choices.map((choice) => <button key={choice.label} type="button" disabled={busy.includes(key)} onClick={() => void save(item, choice.status, choice.reason)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${selected === (choice.reason ?? choice.status) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50"}`}>{choice.label}</button>)}
						<label className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
							<input type="checkbox" disabled={busy.includes(key)} onChange={(event) => { if (event.currentTarget.checked) void save(item, "completed"); }} className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500" />
							Fait
						</label>
					</div>
				</article>;
			})}</div>}
	</div>;
}
