import { useState } from "react";

interface TodayIterationCheckboxProps {
	iterationNumber: number;
	onComplete: () => Promise<void>;
}

export default function TodayIterationCheckbox({ iterationNumber, onComplete }: TodayIterationCheckboxProps) {
	const [pending, setPending] = useState(false);

	const handleChange = async (isChecked: boolean) => {
		if (!isChecked || pending) return;
		setPending(true);
		try {
			await onComplete();
		} catch {
			// The page request hook exposes any error to the user.
		} finally {
			setPending(false);
		}
	};

	return (
		<label className="relative inline-flex cursor-pointer items-center" aria-label={`Répétition ${iterationNumber}`}>
			<input
				type="checkbox"
				aria-label={`Répétition ${iterationNumber}`}
				checked={pending}
				disabled={pending}
				onChange={(event) => { void handleChange(event.currentTarget.checked); }}
				className="peer h-9 w-9 appearance-none rounded-md border-2 border-blue-500 bg-white transition-colors checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-wait"
			/>
			<span className="pointer-events-none absolute inset-0 grid place-items-center font-semibold text-blue-700 peer-checked:text-white">
				{iterationNumber}
			</span>
		</label>
	);
}
