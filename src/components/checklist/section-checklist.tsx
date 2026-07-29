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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Item } from "@/lib/types"
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

export function SectionChecklist({
  sectionId,
  initialItems,
}: {
  sectionId: string
  initialItems: Item[]
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

  function handleAdd(title: string, price: number | null) {
    const newItem: Item = {
      id: crypto.randomUUID(),
      household_id: "",
      section_id: sectionId,
      subsection: null,
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
        await addItemAction(path, sectionId, newItem.id, newItem.title, newItem.price)
      } catch {
        toast.error("Не вдалось додати пункт. Спробуйте ще раз.")
      }
    })
  }

  const sorted = optimisticItems.slice().sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Поки немає пунктів. Додайте перший.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sorted.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              isPending={isPending}
              onToggle={() => handleToggle(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </ul>
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
              handleAdd(title, price)
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
            <DialogFooter>
              <Button type="submit">Додати</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
