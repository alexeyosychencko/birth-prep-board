import { getCurrentWeek, getDaysUntilDue, DUE_DATE_WEEK } from "@/lib/pregnancy"
import { getWeekContent } from "@/lib/content/week-content"
import {
  householdRepository,
  pregnancyRepository,
  itemsRepository,
  budgetRepository,
} from "@/lib/repositories"
import { SECTIONS_LIST } from "@/lib/sections"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { ProgressValueText } from "@/components/progress-value-text"
import { WeekTimeline } from "@/components/dashboard/week-timeline"
import { DueChecklist } from "@/components/dashboard/due-checklist"
import { UpcomingList } from "@/components/dashboard/upcoming-list"
import { SectionGrid } from "@/components/dashboard/section-grid"
import { BudgetCard } from "@/components/dashboard/budget-card"

const sectionTitleById = Object.fromEntries(
  SECTIONS_LIST.map((section) => [section.id, section.title_uk])
)

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [pregnancy, items, budgetGoal] = await Promise.all([
    pregnancyRepository.getPregnancy(household.id),
    itemsRepository.getAllItems(household.id),
    budgetRepository.getBudgetGoal(household.id),
  ])

  if (!pregnancy) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading italic">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Дані про вагітність не знайдено.</p>
      </div>
    )
  }

  const dueDate = new Date(pregnancy.due_date)
  const currentWeek = getCurrentWeek(dueDate)
  const daysUntilDue = getDaysUntilDue(dueDate)
  const isOverdue = currentWeek > DUE_DATE_WEEK
  const dueLabel =
    daysUntilDue >= 0
      ? `${daysUntilDue} ${pluralizeDays(daysUntilDue)} до ПДР`
      : `минув ${Math.abs(daysUntilDue)} ${pluralizeDays(Math.abs(daysUntilDue))} тому`
  const weekContent = getWeekContent(isOverdue ? DUE_DATE_WEEK : currentWeek)
  const done = items.filter((item) => item.status === "done").length
  const total = items.length
  const checklistProgress = total > 0 ? (done / total) * 100 : 0

  const [dueItems, upcomingItems] = await Promise.all([
    itemsRepository.getItemsDueByWeek(household.id, currentWeek),
    itemsRepository.getItemsForTargetWeek(household.id, currentWeek + 1),
  ])
  const sortedDueItems = dueItems
    .filter((item): item is typeof item & { target_week: number } => item.target_week !== null)
    .sort((a, b) => a.target_week - b.target_week)

  const sectionProgress = SECTIONS_LIST.map((section) => {
    const sectionItems = items.filter((item) => item.section_id === section.id)
    return {
      section,
      done: sectionItems.filter((item) => item.status === "done").length,
      total: sectionItems.length,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-heading italic">Дашборд</h1>

      <WeekTimeline
        currentWeek={currentWeek}
        weekLabel={isOverdue ? "40+" : String(currentWeek)}
        dueLabel={dueLabel}
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <DueChecklist items={sortedDueItems} sectionTitleById={sectionTitleById} currentWeek={currentWeek} />
          <UpcomingList items={upcomingItems} sectionTitleById={sectionTitleById} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Чеклісти</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={checklistProgress}>
                <ProgressLabel>Виконано пунктів</ProgressLabel>
                <ProgressValueText value={`${done} з ${total}`} />
              </Progress>
            </CardContent>
          </Card>

          <BudgetCard goal={budgetGoal} items={items} />

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
      </div>

      <SectionGrid sections={sectionProgress} />
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
