import { Badge } from "@/components/ui/badge"
import { ItemToggle } from "@/components/dashboard/item-toggle"
import { AddItemDialog } from "@/components/checklist/add-item-dialog"
import { formatWeekBadgeLabel } from "@/lib/pregnancy"
import type { Item } from "@/lib/types"

type DueItem = Item & { target_week: number }

const VISIBLE_COUNT = 8

export function DueChecklist({
  items,
  sectionTitleById,
  currentWeek,
}: {
  items: DueItem[]
  sectionTitleById: Record<string, string>
  currentWeek: number
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-heading font-medium">Пора зробити</h2>
          <AddItemDialog triggerVariant="default" />
        </div>
        <p className="text-sm text-muted-foreground">
          Усе під контролем — прострочених пунктів немає.
        </p>
      </div>
    )
  }

  const visible = items.slice(0, VISIBLE_COUNT)
  const rest = items.slice(VISIBLE_COUNT)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-heading font-medium">Пора зробити</h2>
        <AddItemDialog triggerVariant="default" />
      </div>
      <ul className="flex flex-col gap-1">
        {visible.map((item) => (
          <DueRow key={item.id} item={item} sectionTitle={sectionTitleById[item.section_id]} currentWeek={currentWeek} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm text-muted-foreground">
            {`Показати всі (${items.length})`}
          </summary>
          <ul className="mt-1 flex flex-col gap-1">
            {rest.map((item) => (
              <DueRow key={item.id} item={item} sectionTitle={sectionTitleById[item.section_id]} currentWeek={currentWeek} />
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function DueRow({
  item,
  sectionTitle,
  currentWeek,
}: {
  item: DueItem
  sectionTitle: string
  currentWeek: number
}) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <ItemToggle item={item} />
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-sm">{item.title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{sectionTitle}</span>
        {item.status === "in_progress" && (
          <Badge className="shrink-0 bg-accent text-accent-foreground">в процесі</Badge>
        )}
      </div>
      <Badge variant="secondary" className="shrink-0 font-mono tabular-nums">
        {formatWeekBadgeLabel(item.target_week, currentWeek)}
      </Badge>
    </li>
  )
}
