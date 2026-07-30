import { getCurrentWeek, DUE_DATE_WEEK } from "@/lib/pregnancy"
import { getWeekContent } from "@/lib/content/week-content"
import { householdRepository, pregnancyRepository, itemsRepository } from "@/lib/repositories"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress"
import { ProgressValueText } from "@/components/progress-value-text"

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

  const currentWeek = getCurrentWeek(new Date(pregnancy.due_date))
  const weekContent = getWeekContent(currentWeek)
  const weekProgress = Math.min(100, (currentWeek / DUE_DATE_WEEK) * 100)
  const done = items.filter((item) => item.is_checked).length
  const total = items.length
  const checklistProgress = total > 0 ? (done / total) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Дашборд</h1>

      <Progress value={weekProgress}>
        <ProgressLabel>{`Тиждень ${currentWeek} з 40`}</ProgressLabel>
      </Progress>

      <Progress value={checklistProgress}>
        <ProgressLabel>Виконано пунктів чеклиста</ProgressLabel>
        <ProgressValueText value={`${done} з ${total}`} />
      </Progress>

      <Card>
        <CardHeader>
          <CardTitle>
            {weekContent ? `Фокус тижня ${currentWeek}: ${weekContent.title}` : "Фокус тижня"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {weekContent
              ? weekContent.tip
              : "Контент фокусу тижня починається з 20-го тижня вагітності."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
