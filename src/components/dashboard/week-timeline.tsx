import { cn } from "@/lib/utils"

const TOTAL_WEEKS = 40

export function WeekTimeline({ currentWeek }: { currentWeek: number }) {
  const filledUpTo = Math.min(TOTAL_WEEKS, currentWeek)

  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`Тиждень ${currentWeek} з ${TOTAL_WEEKS}`}
    >
      {Array.from({ length: TOTAL_WEEKS }, (_, index) => {
        const week = index + 1
        const isCurrent = week === filledUpTo
        const isDone = week < filledUpTo
        return (
          <div
            key={week}
            className={cn(
              "h-1.5 flex-1 rounded-full md:h-2",
              isCurrent ? "bg-primary" : isDone ? "bg-primary/50" : "bg-muted"
            )}
          />
        )
      })}
    </div>
  )
}
