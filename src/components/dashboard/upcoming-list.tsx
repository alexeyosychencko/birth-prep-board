import type { Item } from "@/lib/types"

export function UpcomingList({
  items,
  sectionTitleById,
}: {
  items: Item[]
  sectionTitleById: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-heading font-medium text-muted-foreground">
        {items.length > 0 ? `Наступного тижня (${items.length})` : "Наступного тижня"}
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Немає запланованих пунктів.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline gap-2">
              <span className="shrink-0 text-xs text-muted-foreground">
                {sectionTitleById[item.section_id]}
              </span>
              <span className="truncate text-sm">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
