import { getCurrentWeek } from "@/lib/pregnancy"
import { getWeekContent } from "@/lib/mock/week-content"
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
import { WeekProgressValue } from "@/components/week-progress-value"

const WEEK_MIN = 20
const WEEK_MAX = 40

export default function Page() {
  const currentWeek = getCurrentWeek(MOCK_DUE_DATE)
  const weekContent = getWeekContent(currentWeek)
  const weekProgress = ((currentWeek - WEEK_MIN) / (WEEK_MAX - WEEK_MIN)) * 100
  const checklistProgress =
    (MOCK_CHECKLIST_PROGRESS.done / MOCK_CHECKLIST_PROGRESS.total) * 100

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Дашборд</h1>

      <Progress value={weekProgress}>
        <ProgressLabel>{`Тиждень ${currentWeek} з 40`}</ProgressLabel>
        <WeekProgressValue value={`${currentWeek - WEEK_MIN} / ${WEEK_MAX - WEEK_MIN}`} />
      </Progress>

      <Progress value={checklistProgress}>
        <ProgressLabel>Виконано пунктів чеклиста</ProgressLabel>
        <WeekProgressValue value={`${MOCK_CHECKLIST_PROGRESS.done} з ${MOCK_CHECKLIST_PROGRESS.total}`} />
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
