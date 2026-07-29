import {
  getCurrentWeek,
  PREGNANCY_WEEK_MAX,
  PREGNANCY_WEEK_MIN,
} from "@/lib/pregnancy"
import { getWeekContent } from "@/lib/content/week-content"
import { MOCK_CHECKLIST_PROGRESS, MOCK_DUE_DATE } from "@/lib/mock/household"
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

export default function Page() {
  const currentWeek = getCurrentWeek(MOCK_DUE_DATE)
  const weekContent = getWeekContent(currentWeek)
  const weekProgress =
    ((currentWeek - PREGNANCY_WEEK_MIN) /
      (PREGNANCY_WEEK_MAX - PREGNANCY_WEEK_MIN)) *
    100
  const checklistProgress =
    (MOCK_CHECKLIST_PROGRESS.done / MOCK_CHECKLIST_PROGRESS.total) * 100

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Дашборд</h1>

      <Progress value={weekProgress}>
        <ProgressLabel>{`Тиждень ${currentWeek} з 40`}</ProgressLabel>
      </Progress>

      <Progress value={checklistProgress}>
        <ProgressLabel>Виконано пунктів чеклиста</ProgressLabel>
        <ProgressValueText value={`${MOCK_CHECKLIST_PROGRESS.done} з ${MOCK_CHECKLIST_PROGRESS.total}`} />
      </Progress>

      <Card>
        <CardHeader>
          <CardTitle>{`Фокус тижня ${currentWeek}: ${weekContent.title}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{weekContent.tip}</p>
        </CardContent>
      </Card>
    </div>
  )
}
