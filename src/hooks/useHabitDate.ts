import { useEffect, useState } from "react";
import { get_4to4_gliding_day } from "../lib/get_4to4_gliding_day";

export function useHabitDate(): string {
	const [habitDate, setHabitDate] = useState(get_4to4_gliding_day);

	useEffect(() => {
		const refresh = () => {
			const nextDate = get_4to4_gliding_day();
			setHabitDate((current) => current === nextDate ? current : nextDate);
		};
		const interval = window.setInterval(refresh, 60_000);
		window.addEventListener("focus", refresh);
		document.addEventListener("visibilitychange", refresh);
		return () => {
			window.clearInterval(interval);
			window.removeEventListener("focus", refresh);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, []);

	return habitDate;
}
