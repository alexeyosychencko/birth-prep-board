"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import type { Item } from "@/lib/types"
import { toggleItemAction } from "@/lib/actions/checklist-actions"

export function ItemToggle({ item }: { item: Item }) {
  const [isChecked, setOptimisticChecked] = useOptimistic(
    item.is_checked,
    (_current: boolean, next: boolean) => next
  )
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      setOptimisticChecked(!isChecked)
      try {
        await toggleItemAction("/", item.id)
      } catch {
        toast.error("Не вдалось оновити пункт. Спробуйте ще раз.")
      }
    })
  }

  return (
    <Checkbox
      checked={isChecked}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label={`Позначити «${item.title}» виконаним`}
    />
  )
}
