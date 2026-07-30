"use client"

import { useState, useOptimistic, useTransition } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddItemDialog } from "@/components/checklist/add-item-dialog"
import { TargetWeekField } from "@/components/checklist/target-week-field"
import { PriceField } from "@/components/checklist/price-field"
import { NoteIndicator, NoteView, NoteEditor } from "@/components/checklist/note-field"
import type { Item, ItemStatus, Subsection } from "@/lib/types"
import {
  setItemStatusAction,
  deleteItemAction,
  updateItemPriceAction,
  updateItemTargetWeekAction,
  updateItemNoteAction,
} from "@/lib/actions/checklist-actions"

type OptimisticAction =
  | { type: "setStatus"; itemId: string; status: ItemStatus }
  | { type: "add"; item: Item }
  | { type: "delete"; itemId: string }
  | { type: "updatePrice"; itemId: string; price: number | null }
  | { type: "updateTargetWeek"; itemId: string; targetWeek: number | null }
  | { type: "updateNote"; itemId: string; note: string | null }

function reduceOptimistic(state: Item[], action: OptimisticAction): Item[] {
  switch (action.type) {
    case "setStatus":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, status: action.status } : item
      )
    case "add":
      return [...state, action.item]
    case "delete":
      return state.filter((item) => item.id !== action.itemId)
    case "updatePrice":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, price: action.price } : item
      )
    case "updateTargetWeek":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, target_week: action.targetWeek } : item
      )
    case "updateNote":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, note: action.note } : item
      )
  }
}

function ChecklistRow({
  item,
  isPending,
  currentWeek,
  onSetStatus,
  onDelete,
  onUpdatePrice,
  onUpdateTargetWeek,
  onUpdateNote,
}: {
  item: Item
  isPending: boolean
  currentWeek: number | null
  onSetStatus: (status: ItemStatus) => void
  onDelete: () => void
  onUpdatePrice: (price: number | null) => void
  onUpdateTargetWeek: (targetWeek: number | null) => void
  onUpdateNote: (note: string | null) => void
}) {
  const [weekEditing, setWeekEditing] = useState(false)
  const [noteExpanded, setNoteExpanded] = useState(false)
  const [noteEditing, setNoteEditing] = useState(false)

  const hasNote = item.note !== null
  const showNoteBelow = noteEditing || (hasNote && noteExpanded)

  return (
    <li className="flex flex-col gap-1 py-1.5">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={item.status === "done"}
          onCheckedChange={() => onSetStatus(item.status === "done" ? "todo" : "done")}
          disabled={isPending}
          aria-label={`Позначити «${item.title}» виконаним`}
        />
        <span className="flex-1 truncate text-sm">{item.title}</span>
        {item.status === "in_progress" && (
          <Badge className="shrink-0 bg-accent text-accent-foreground">в процесі</Badge>
        )}
        <NoteIndicator hasNote={hasNote} expanded={noteExpanded} onToggle={() => setNoteExpanded((v) => !v)} />
        <PriceField item={item} isPending={isPending} onUpdate={onUpdatePrice} />
        <TargetWeekField
          item={item}
          isPending={isPending}
          onUpdate={onUpdateTargetWeek}
          editing={weekEditing}
          onEditingChange={setWeekEditing}
          currentWeek={currentWeek}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label="Дії з пунктом" disabled={isPending} />}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.status !== "done" && (
              <DropdownMenuItem
                onClick={() => onSetStatus(item.status === "in_progress" ? "todo" : "in_progress")}
              >
                {item.status === "in_progress" ? "Прибрати позначку" : "Позначити в процесі"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setNoteEditing(true)}>
              {hasNote ? "Редагувати нотатку" : "Додати нотатку"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setWeekEditing(true)}>Змінити тиждень</DropdownMenuItem>
            {!item.is_seed && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  Видалити
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {showNoteBelow &&
        (noteEditing ? (
          <NoteEditor
            item={item}
            isPending={isPending}
            onUpdate={onUpdateNote}
            onDone={() => {
              setNoteEditing(false)
              setNoteExpanded(true)
            }}
          />
        ) : (
          <NoteView note={item.note!} />
        ))}
    </li>
  )
}

function ChecklistList({
  items,
  isPending,
  currentWeek,
  onSetStatus,
  onDelete,
  onUpdatePrice,
  onUpdateTargetWeek,
  onUpdateNote,
}: {
  items: Item[]
  isPending: boolean
  currentWeek: number | null
  onSetStatus: (item: Item, status: ItemStatus) => void
  onDelete: (item: Item) => void
  onUpdatePrice: (item: Item, price: number | null) => void
  onUpdateTargetWeek: (item: Item, targetWeek: number | null) => void
  onUpdateNote: (item: Item, note: string | null) => void
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
          currentWeek={currentWeek}
          onSetStatus={(status) => onSetStatus(item, status)}
          onDelete={() => onDelete(item)}
          onUpdatePrice={(price) => onUpdatePrice(item, price)}
          onUpdateTargetWeek={(targetWeek) => onUpdateTargetWeek(item, targetWeek)}
          onUpdateNote={(note) => onUpdateNote(item, note)}
        />
      ))}
    </ul>
  )
}

export function SectionChecklist({
  sectionId,
  initialItems,
  subsections,
  currentWeek = null,
}: {
  sectionId: string
  initialItems: Item[]
  subsections?: { key: Subsection; title: string }[]
  currentWeek?: number | null
}) {
  const path = usePathname()
  const [optimisticItems, applyOptimistic] = useOptimistic(initialItems, reduceOptimistic)
  const [isPending, startTransition] = useTransition()

  function handleSetStatus(item: Item, status: ItemStatus) {
    startTransition(async () => {
      applyOptimistic({ type: "setStatus", itemId: item.id, status })
      try {
        await setItemStatusAction(path, item.id, status)
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

  function handleUpdateTargetWeek(item: Item, targetWeek: number | null) {
    startTransition(async () => {
      applyOptimistic({ type: "updateTargetWeek", itemId: item.id, targetWeek })
      try {
        await updateItemTargetWeekAction(path, item.id, targetWeek)
      } catch {
        toast.error("Не вдалось оновити тиждень. Спробуйте ще раз.")
      }
    })
  }

  function handleUpdateNote(item: Item, note: string | null) {
    startTransition(async () => {
      applyOptimistic({ type: "updateNote", itemId: item.id, note })
      try {
        await updateItemNoteAction(path, item.id, note)
      } catch {
        toast.error("Не вдалось оновити нотатку. Спробуйте ще раз.")
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
              currentWeek={currentWeek}
              onSetStatus={handleSetStatus}
              onDelete={handleDelete}
              onUpdatePrice={handleUpdatePrice}
              onUpdateTargetWeek={handleUpdateTargetWeek}
              onUpdateNote={handleUpdateNote}
            />
          </div>
        ))
      ) : (
        <ChecklistList
          items={sorted}
          isPending={isPending}
          currentWeek={currentWeek}
          onSetStatus={handleSetStatus}
          onDelete={handleDelete}
          onUpdatePrice={handleUpdatePrice}
          onUpdateTargetWeek={handleUpdateTargetWeek}
          onUpdateNote={handleUpdateNote}
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
