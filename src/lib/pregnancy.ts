const PREGNANCY_WEEK_MIN = 20
const PREGNANCY_WEEK_MAX = 40
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function getCurrentWeek(dueDate: Date, today: Date = new Date()): number {
  const weeksUntilDue = Math.round((dueDate.getTime() - today.getTime()) / MS_PER_WEEK)
  const week = PREGNANCY_WEEK_MAX - weeksUntilDue
  return Math.min(PREGNANCY_WEEK_MAX, Math.max(PREGNANCY_WEEK_MIN, week))
}
