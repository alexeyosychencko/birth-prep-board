import { cn } from "@/lib/utils"

const TOTAL_WEEKS = 40

const TRIMESTERS = [
  { label: "I триместр", from: 1, to: 13 },
  { label: "II триместр", from: 14, to: 27 },
  { label: "III триместр", from: 28, to: 40 },
]

function isBoundaryWeek(week: number): boolean {
  return week === 1 || week === 13 || week === 14 || week === 27 || week === 28 || week === TOTAL_WEEKS
}

export function WeekTimeline({
  currentWeek,
  weekLabel,
  dueLabel,
}: {
  currentWeek: number
  weekLabel: string
  dueLabel: string
}) {
  const clampedWeek = Math.min(TOTAL_WEEKS, Math.max(1, currentWeek))
  const flagPosition = ((clampedWeek - 0.5) / TOTAL_WEEKS) * 100
  const currentTrimester = TRIMESTERS.find((t) => clampedWeek >= t.from && clampedWeek <= t.to)

  return (
    <div
      className="flex flex-col gap-1"
      role="img"
      aria-label={`Гестаційна рулетка: тиждень ${weekLabel} з ${TOTAL_WEEKS}, ${dueLabel}`}
    >
      <div className="flex" aria-hidden="true">
        {TRIMESTERS.map((trimester) => (
          <span
            key={trimester.label}
            className={cn(
              "text-[11px] font-medium tracking-wide uppercase",
              trimester === currentTrimester ? "text-foreground" : "text-muted-foreground/60"
            )}
            style={{ width: `${((trimester.to - trimester.from + 1) / TOTAL_WEEKS) * 100}%` }}
          >
            {trimester.label}
          </span>
        ))}
      </div>

      <div className="relative pt-9" aria-hidden="true">
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center motion-safe:animate-[ruler-drop_0.5s_ease-out_backwards]"
          style={{ left: `${flagPosition}%`, animationDelay: "260ms" }}
        >
          <div className="flex items-baseline gap-1 rounded-sm bg-signature px-2 py-1 font-mono text-xs font-medium whitespace-nowrap text-signature-foreground">
            <span className="text-sm font-semibold tabular-nums">{weekLabel}</span>
            <span>тиж · {dueLabel}</span>
          </div>
          <div className="h-3 w-px bg-signature" />
        </div>

        <div className="flex h-8 items-end gap-0 border-b border-border">
          {Array.from({ length: TOTAL_WEEKS }, (_, index) => {
            const week = index + 1
            const isBoundary = isBoundaryWeek(week)
            const isMajor = week % 4 === 0 || isBoundary
            const isPast = week <= clampedWeek

            return (
              <div key={week} className="flex flex-1 flex-col items-center justify-end gap-1">
                {isMajor && (week % 8 === 0 || week === 1 || week === TOTAL_WEEKS) && (
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{week}</span>
                )}
                <div
                  className={cn(
                    "w-px origin-bottom motion-safe:animate-[ruler-grow_0.35s_ease-out_backwards]",
                    isMajor ? "h-3" : "h-1.5",
                    isPast ? "bg-primary" : "bg-foreground/15"
                  )}
                  style={{ animationDelay: `${index * 8}ms` }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
