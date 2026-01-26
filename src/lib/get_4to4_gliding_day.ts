/**
 * Retourne la date de la journée glissante (4h à 4h)
 * Si l'heure actuelle est avant 4h du matin, on retourne la veille
 * Si l'heure actuelle est à partir de 4h, on retourne aujourd'hui
 * 
 * @returns Date au format YYYY-MM-DD
 */
export function getGlidingDay(): string {
  const now = new Date();
  const hour = now.getHours();
  
  // Si avant 4h du matin, retourner la veille
  if (hour < 4) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]!;
  }
  
  // Sinon, retourner aujourd'hui
  return now.toISOString().split("T")[0]!;
}
