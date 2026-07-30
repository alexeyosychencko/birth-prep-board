"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import type { Item, ItemStatus } from "@/lib/types"
import { setItemStatusAction } from "@/lib/actions/checklist-actions"

export function ItemToggle({ item }: { item: Item }) {
  const [status, setOptimisticStatus] = useOptimistic(
    item.status,
    (_current: ItemStatus, next: ItemStatus) => next
  )
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const next: ItemStatus = status === "done" ? "todo" : "done"
    startTransition(async () => {
      setOptimisticStatus(next)
      try {
        await setItemStatusAction("/", item.id, next)
      } catch {
        toast.error("Не вдалось оновити пункт. Спробуйте ще раз.")
      }
    })
  }

  return (
    <Checkbox
      checked={status === "done"}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label={`Позначити «${item.title}» виконаним`}
    />
  )
}
