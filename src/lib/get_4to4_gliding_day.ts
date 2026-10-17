/**
 * Retourne la date de la journée glissante (4h à 4h)
 * Si l'heure actuelle est avant 4h du matin, on retourne la veille
 * Si l'heure actuelle est à partir de 4h, on retourne aujourd'hui
 * 
 * @returns Date au format YYYY-MM-DD
 */
export function get_4to4_gliding_day(): string {
  const habitDay = new Date();
  if (habitDay.getHours() < 4) habitDay.setDate(habitDay.getDate() - 1);
  return formatLocalDate(habitDay);
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHabitDateForDate(date: Date): string {
  const habitDay = new Date(date);
  if (habitDay.getHours() < 4) habitDay.setDate(habitDay.getDate() - 1);
  return formatLocalDate(habitDay);
}
