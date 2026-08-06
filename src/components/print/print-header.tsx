import { DUE_DATE_WEEK } from "@/lib/pregnancy"
import { formatPrintDate } from "@/lib/print"

export function PrintHeader({
  dueDate,
  currentWeek,
  printDate,
}: {
  dueDate: string | null
  currentWeek: number | null
  printDate: Date
}) {
  const isOverdue = currentWeek !== null && currentWeek > DUE_DATE_WEEK

  return (
    <header className="flex flex-col gap-1 print:break-inside-avoid">
      <h1 className="text-3xl font-heading italic">Пакет у пологовий</h1>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1">
          <dt className="text-muted-foreground">ПДР:</dt>
          <dd>{dueDate ? formatPrintDate(new Date(dueDate)) : "не задано"}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Поточний тиждень:</dt>
          <dd className="font-mono tabular-nums">{currentWeek === null ? "не задано" : `${isOverdue ? "40+" : currentWeek} з 40`}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Дата друку:</dt>
          <dd>{formatPrintDate(printDate)}</dd>
        </div>
      </dl>
    </header>
  )
}
