export const PREGNANCY_WEEK_MIN = 0
export const PREGNANCY_WEEK_MAX = 42
export const DUE_DATE_WEEK = 40
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

function toUTCDayMs(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getCurrentWeek(dueDate: Date, today: Date = new Date()): number {
  const weeksUntilDue = Math.ceil(
    (toUTCDayMs(dueDate) - toUTCDayMs(today)) / MS_PER_WEEK
  )
  const week = DUE_DATE_WEEK - weeksUntilDue
  return Math.min(PREGNANCY_WEEK_MAX, Math.max(PREGNANCY_WEEK_MIN, week))
}
