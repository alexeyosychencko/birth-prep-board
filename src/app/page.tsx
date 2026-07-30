import { getCurrentWeek, getDaysUntilDue, DUE_DATE_WEEK } from "@/lib/pregnancy"
import { getWeekContent } from "@/lib/content/week-content"
import { householdRepository, pregnancyRepository, itemsRepository } from "@/lib/repositories"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { WeekTimeline } from "@/components/dashboard/week-timeline"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [pregnancy, items] = await Promise.all([
    pregnancyRepository.getPregnancy(household.id),
    itemsRepository.getAllItems(household.id),
  ])

  if (!pregnancy) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-semibold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Дані про вагітність не знайдено.</p>
      </div>
    )
  }

  const dueDate = new Date(pregnancy.due_date)
  const currentWeek = getCurrentWeek(dueDate)
  const daysUntilDue = getDaysUntilDue(dueDate)
  const isOverdue = currentWeek > DUE_DATE_WEEK
  const weekContent = getWeekContent(isOverdue ? DUE_DATE_WEEK : currentWeek)
  const done = items.filter((item) => item.is_checked).length
  const total = items.length

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Дашборд</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="flex items-baseline gap-1">
            <span className="font-heading text-3xl font-semibold tabular-nums">
              {isOverdue ? "40+" : currentWeek}
            </span>
            <span className="text-sm text-muted-foreground">з 40</span>
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {daysUntilDue >= 0
              ? `${daysUntilDue} ${pluralizeDays(daysUntilDue)} до ПДР`
              : `ПДР минув ${Math.abs(daysUntilDue)} ${pluralizeDays(Math.abs(daysUntilDue))} тому`}
          </p>
        </div>
        <WeekTimeline currentWeek={currentWeek} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {weekContent
              ? `Фокус тижня ${isOverdue ? "40+" : currentWeek}: ${weekContent.title}`
              : "Фокус тижня"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm">
            {weekContent
              ? weekContent.tip
              : "Контент фокусу тижня починається з 20-го тижня вагітності."}
          </p>
          {isOverdue && (
            <p className="text-sm text-muted-foreground">ПДР уже минув — можливо, малюк ось-ось народиться.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function pluralizeDays(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return "день"
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дні"
  return "днів"
}
