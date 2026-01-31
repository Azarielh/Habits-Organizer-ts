
export function getFrequencyLabel(frequency: any): string {
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
}

/**
 * Converts a time slot (time) into a readable label with emoji.
 */
export function getTimeLabel(time: string): string {
  const labels: Record<string, string> = {
    morning: "🌅 Matin",
    afternoon: "☀️ Après-midi",
    evening: "🌙 Soir",
  };
  return labels[time] || "";
}
