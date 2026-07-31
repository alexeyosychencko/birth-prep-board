import type { Item, Subsection } from "@/lib/types"

function PrintCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-current text-[10px] leading-none"
    >
      {checked ? "✓" : ""}
    </span>
  )
}

function PrintChecklistRow({ item }: { item: Item }) {
  return (
    <li className="flex flex-col gap-0.5 py-1 print:break-inside-avoid">
      <div className="flex items-baseline gap-2">
        <PrintCheckbox checked={item.status === "done"} />
        <span className="text-sm">
          {item.title}
          {item.status === "in_progress" && " · в процесі"}
        </span>
        {item.price !== null && (
          <span className="ml-auto shrink-0 text-sm">{item.price} грн</span>
        )}
      </div>
      {item.note !== null && <p className="pl-6 text-sm whitespace-pre-wrap">{item.note}</p>}
    </li>
  )
}

function PrintChecklistGroup({ title, items }: { title?: string; items: Item[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      {title && <h3 className="text-sm font-heading font-medium">{title}</h3>}
      <ul>
        {items.map((item) => (
          <PrintChecklistRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

export function PrintChecklistSection({
  title,
  items,
  subsections,
}: {
  title: string
  items: Item[]
  subsections?: { key: Subsection; title: string }[]
}) {
  return (
    <section className="flex flex-col gap-3 print:break-before-page">
      <h2 className="text-base font-heading font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm">Немає пунктів.</p>
      ) : subsections ? (
        <div className="flex flex-col gap-4">
          {subsections.map((group) => (
            <PrintChecklistGroup
              key={group.key}
              title={group.title}
              items={items.filter((item) => item.subsection === group.key)}
            />
          ))}
        </div>
      ) : (
        <PrintChecklistGroup items={items} />
      )}
    </section>
  )
}
