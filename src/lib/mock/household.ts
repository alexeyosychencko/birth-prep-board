// Parsed as UTC midnight (date-only ISO string), while `getCurrentWeek`'s
// default `today = new Date()` is local time — the computed week can shift
// by up to a day near a week boundary depending on the runtime timezone.
// Fine for a design-phase mock; not a bug.
export const MOCK_DUE_DATE = new Date("2026-09-21")

export const MOCK_CHECKLIST_PROGRESS = {
  done: 18,
  total: 47,
}
