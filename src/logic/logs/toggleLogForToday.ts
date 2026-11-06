import type { CompletedLog } from "../../lib/type";
import { get_4to4_gliding_day } from "../../lib/get_4to4_gliding_day";

/**
 * Gère le toggle d'un log pour aujourd'hui basé sur l'état du checkbox :
 * - Si isChecked = true → s'assurer qu'il y a un log completed d'aujourd'hui
 * - Si isChecked = false → supprimer le log completed d'aujourd'hui
 */
export function toggleLogForToday(completedLogs: CompletedLog[], isChecked: boolean): CompletedLog[] {
  const today = get_4to4_gliding_day();
  
  // Chercher un log complété d'aujourd'hui
  const todayLogIndex = completedLogs.findIndex(log => {
    if (!log.completedAt) return false;
    return log.completedAt.split('T')[0] === today;
  });
  
  if (isChecked) {
    // Checkbox cochée → s'assurer qu'il y a un log
    if (todayLogIndex >= 0) {
      // Log existe déjà, rien à faire
      return completedLogs;
    } else {
      // Ajouter un nouveau log
      const newLog: CompletedLog = {
        status: "completed",
        completedAt: new Date().toISOString(),
        constraints: "" as any
      };
      return [...completedLogs, newLog];
    }
  } else {
    // Checkbox décochée → supprimer le log s'il existe
    if (todayLogIndex >= 0) {
      return completedLogs.filter((_, index) => index !== todayLogIndex);
    } else {
      // Log n'existe pas, rien à faire
      return completedLogs;
    }
  }
}
