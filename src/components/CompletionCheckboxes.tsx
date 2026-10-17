import { useState } from "react";
import type { Habit } from "../lib/type";
import { getCompletedIterationIndexes } from "../../habits";

interface CompletionCheckboxesProps {
	habit: Habit;
	periodKey: string;
	onChange: (iterationIndex: number, isChecked: boolean) => Promise<void>;
}

export default function CompletionCheckboxes({ habit, periodKey, onChange }: CompletionCheckboxesProps) {
	const [pending, setPending] = useState(false);
	const iterationCount = Math.max(1, habit.iteration || 1);
	const completedIndexes = getCompletedIterationIndexes(habit, periodKey);
	const handleChange = async (index: number, isChecked: boolean) => {
		setPending(true);
		try {
			await onChange(index, isChecked);
		} catch {
			// The request hook exposes the error in the page; keep this input controlled.
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3" aria-label={`Réalisations de ${habit.name}`}>
			{Array.from({ length: iterationCount }, (_, index) => (
				<label key={index} className="flex items-center gap-1.5 text-sm text-slate-600">
					<input
						type="checkbox"
						aria-label={`${habit.name} — répétition ${index + 1}`}
						checked={completedIndexes.has(index)}
						disabled={pending}
						onChange={(event) => { void handleChange(index, event.currentTarget.checked); }}
						className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
					{iterationCount > 1 && <span>{index + 1}</span>}
				</label>
			))}
		</div>
	);
}
