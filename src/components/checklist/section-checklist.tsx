"use client"

import { useOptimistic, useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Item, Subsection } from "@/lib/types"
import { toggleItemAction, addItemAction, deleteItemAction } from "@/lib/actions/checklist-actions"

type OptimisticAction =
  | { type: "toggle"; itemId: string }
  | { type: "add"; item: Item }
  | { type: "delete"; itemId: string }

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
  }
}

function ChecklistRow({
  item,
  isPending,
  onToggle,
  onDelete,
}: {
  item: Item
  isPending: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <Checkbox checked={item.is_checked} onCheckedChange={onToggle} disabled={isPending} />
      <span className="flex-1 text-sm">{item.title}</span>
      {item.price !== null && <span className="text-sm text-muted-foreground">{item.price} грн</span>}
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
}: {
  items: Item[]
  isPending: boolean
  onToggle: (item: Item) => void
  onDelete: (item: Item) => void
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
  const [dialogOpen, setDialogOpen] = useState(false)

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

  function handleAdd(title: string, price: number | null, subsection: Subsection | null = null) {
    const newItem: Item = {
      id: crypto.randomUUID(),
      household_id: "",
      section_id: sectionId,
      subsection,
      title,
      price,
      is_checked: false,
      is_seed: false,
      sort_order: Number.MAX_SAFE_INTEGER,
      created_at: new Date().toISOString(),
    }
    setDialogOpen(false)
    startTransition(async () => {
      applyOptimistic({ type: "add", item: newItem })
      try {
        await addItemAction(path, sectionId, newItem.id, newItem.title, newItem.price, subsection)
      } catch {
        toast.error("Не вдалось додати пункт. Спробуйте ще раз.")
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
            />
          </div>
        ))
      ) : (
        <ChecklistList items={sorted} isPending={isPending} onToggle={handleToggle} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" className="self-start" />}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Додати пункт
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новий пункт</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const title = String(formData.get("title") ?? "").trim()
              if (!title) return
              const priceRaw = String(formData.get("price") ?? "").trim()
              const parsedPrice = priceRaw ? Number(priceRaw) : null
              const price = parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null
              const subsectionRaw = formData.get("subsection")
              const subsection = subsections ? (String(subsectionRaw) as Subsection) : null
              if (subsections && !subsection) return
              handleAdd(title, price, subsection)
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Назва</Label>
              <Input id="title" name="title" required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Ціна, грн (опціонально)</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" inputMode="decimal" />
            </div>
            {subsections && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="subsection">Кому</Label>
                <Select
                  name="subsection"
                  required
                  items={subsections.map((group) => ({ value: group.key, label: group.title }))}
                >
                  <SelectTrigger id="subsection">
                    <SelectValue placeholder="Оберіть" />
                  </SelectTrigger>
                  <SelectContent>
                    {subsections.map((group) => (
                      <SelectItem key={group.key} value={group.key}>
                        {group.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="submit">Додати</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
