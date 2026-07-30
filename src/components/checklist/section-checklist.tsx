"use client"

import { useOptimistic, useTransition } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddItemDialog } from "@/components/checklist/add-item-dialog"
import type { Item, Subsection } from "@/lib/types"
import {
  toggleItemAction,
  deleteItemAction,
  updateItemPriceAction,
} from "@/lib/actions/checklist-actions"

type OptimisticAction =
  | { type: "toggle"; itemId: string }
  | { type: "add"; item: Item }
  | { type: "delete"; itemId: string }
  | { type: "updatePrice"; itemId: string; price: number | null }

function reduceOptimistic(state: Item[], action: OptimisticAction): Item[] {
  switch (action.type) {
    case "toggle":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, is_checked: !item.is_checked } : item
      )
    case "add":
      return [...state, action.item]
    case "delete":
      return state.filter((item) => item.id !== action.itemId)
    case "updatePrice":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, price: action.price } : item
      )
  }
}

function ChecklistRow({
  item,
  isPending,
  onToggle,
  onDelete,
  onUpdatePrice,
}: {
  item: Item
  isPending: boolean
  onToggle: () => void
  onDelete: () => void
  onUpdatePrice: (price: number | null) => void
}) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <Checkbox checked={item.is_checked} onCheckedChange={onToggle} disabled={isPending} />
      <span className="flex-1 text-sm">{item.title}</span>
      <Input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        aria-label="Ціна, грн"
        defaultValue={item.price ?? ""}
        disabled={isPending}
        className="h-8 w-20 text-right text-sm text-muted-foreground"
        onBlur={(event) => {
          const raw = event.currentTarget.value.trim()
          const parsed = raw === "" ? null : Number(raw)
          if (parsed !== null && Number.isNaN(parsed)) {
            event.currentTarget.value = item.price === null ? "" : String(item.price)
            return
          }
          if (parsed === item.price) return
          onUpdatePrice(parsed)
        }}
      />
      {!item.is_seed && (
        <Button variant="ghost" size="icon-sm" aria-label="Видалити пункт" disabled={isPending} onClick={onDelete}>
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      )}
    </li>
  )
}

function ChecklistList({
  items,
  isPending,
  onToggle,
  onDelete,
  onUpdatePrice,
}: {
  items: Item[]
  isPending: boolean
  onToggle: (item: Item) => void
  onDelete: (item: Item) => void
  onUpdatePrice: (item: Item, price: number | null) => void
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Поки немає пунктів. Додайте перший.</p>
  }
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          isPending={isPending}
          onToggle={() => onToggle(item)}
          onDelete={() => onDelete(item)}
          onUpdatePrice={(price) => onUpdatePrice(item, price)}
        />
      ))}
    </ul>
  )
}

export function SectionChecklist({
  sectionId,
  initialItems,
  subsections,
}: {
  sectionId: string
  initialItems: Item[]
  subsections?: { key: Subsection; title: string }[]
}) {
  const path = usePathname()
  const [optimisticItems, applyOptimistic] = useOptimistic(initialItems, reduceOptimistic)
  const [isPending, startTransition] = useTransition()

  function handleToggle(item: Item) {
    startTransition(async () => {
      applyOptimistic({ type: "toggle", itemId: item.id })
      try {
        await toggleItemAction(path, item.id)
      } catch {
        toast.error("Не вдалось оновити пункт. Спробуйте ще раз.")
      }
    })
  }

  function handleDelete(item: Item) {
    startTransition(async () => {
      applyOptimistic({ type: "delete", itemId: item.id })
      try {
        await deleteItemAction(path, item.id)
      } catch {
        toast.error("Не вдалось видалити пункт. Спробуйте ще раз.")
      }
    })
  }

  function handleUpdatePrice(item: Item, price: number | null) {
    startTransition(async () => {
      applyOptimistic({ type: "updatePrice", itemId: item.id, price })
      try {
        await updateItemPriceAction(path, item.id, price)
      } catch {
        toast.error("Не вдалось оновити ціну. Спробуйте ще раз.")
      }
    })
  }

  const sorted = optimisticItems.slice().sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col gap-6">
      {subsections ? (
        subsections.map((group) => (
          <div key={group.key} className="flex flex-col gap-2">
            <h2 className="text-base font-heading font-medium">{group.title}</h2>
            <ChecklistList
              items={sorted.filter((item) => item.subsection === group.key)}
              isPending={isPending}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdatePrice={handleUpdatePrice}
            />
          </div>
        ))
      ) : (
        <ChecklistList
          items={sorted}
          isPending={isPending}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdatePrice={handleUpdatePrice}
        />
      )}

      <AddItemDialog
        fixedSectionId={sectionId}
        triggerVariant="outline"
        onAdd={(item) => applyOptimistic({ type: "add", item })}
      />
    </div>
  )
}
