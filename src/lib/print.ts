const MONTHS_UK_GENITIVE = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
]

export function formatPrintDate(date: Date): string {
  const day = date.getDate()
  const month = MONTHS_UK_GENITIVE[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
