"use client"

import { useState, useTransition, type FormEvent } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

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
import { SECTIONS, SECTIONS_LIST, HOSPITAL_BAG_SUBSECTIONS } from "@/lib/sections"
import { addItemAction } from "@/lib/actions/checklist-actions"
import type { Item } from "@/lib/types"

export function AddItemDialog({
  fixedSectionId,
  triggerVariant,
  onAdd,
}: {
  fixedSectionId?: string
  triggerVariant: "default" | "outline"
  onAdd?: (item: Item) => void
}) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [sectionId, setSectionId] = useState(fixedSectionId ?? SECTIONS_LIST[0].id)
  const [isPending, startTransition] = useTransition()

  const isHospitalBag = sectionId === SECTIONS.hospitalBag.id

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const title = String(formData.get("title") ?? "").trim()
    if (!title) return

    const priceRaw = String(formData.get("price") ?? "").trim()
    const parsedPrice = priceRaw ? Number(priceRaw) : null
    const price = parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null

    const targetWeekRaw = String(formData.get("target_week") ?? "").trim()
    const parsedTargetWeek = targetWeekRaw ? Number(targetWeekRaw) : null
    const targetWeek =
      parsedTargetWeek !== null && Number.isInteger(parsedTargetWeek) && parsedTargetWeek >= 1 && parsedTargetWeek <= 42
        ? parsedTargetWeek
        : null

    const subsectionRaw = formData.get("subsection")
    const subsection = isHospitalBag ? (String(subsectionRaw) as Item["subsection"]) : null
    if (isHospitalBag && !subsection) return

    const id = crypto.randomUUID()
    setOpen(false)

    startTransition(async () => {
      if (onAdd) {
        onAdd({
          id,
          household_id: "",
          section_id: sectionId,
          subsection,
          title,
          price,
          target_week: targetWeek,
          status: "todo",
          note: null,
          is_seed: false,
          sort_order: Number.MAX_SAFE_INTEGER,
          created_at: new Date().toISOString(),
        })
      }
      try {
        await addItemAction(path, sectionId, id, title, price, subsection, targetWeek)
      } catch {
        toast.error("Не вдалось додати пункт. Спробуйте ще раз.")
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setSectionId(fixedSectionId ?? SECTIONS_LIST[0].id)
      }}
    >
      <DialogTrigger render={<Button variant={triggerVariant} size="sm" className="self-start" />}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        Додати пункт
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новий пункт</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!fixedSectionId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="section">Розділ</Label>
              <Select
                value={sectionId}
                onValueChange={(value) => setSectionId(value ?? SECTIONS_LIST[0].id)}
                items={SECTIONS_LIST.map((section) => ({ value: section.id, label: section.title_uk }))}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Оберіть розділ" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS_LIST.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title_uk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Назва</Label>
            <Input id="title" name="title" required autoFocus={!!fixedSectionId} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Ціна, грн (опціонально)</Label>
            <Input id="price" name="price" type="number" min="0" step="0.01" inputMode="decimal" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="target_week">Тиждень, до якого зробити (опціонально)</Label>
            <Input id="target_week" name="target_week" type="number" min="1" max="42" step="1" inputMode="numeric" />
          </div>
          {isHospitalBag && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="subsection">Кому</Label>
              <Select
                name="subsection"
                required
                items={HOSPITAL_BAG_SUBSECTIONS.map((group) => ({ value: group.key, label: group.title }))}
              >
                <SelectTrigger id="subsection">
                  <SelectValue placeholder="Оберіть" />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITAL_BAG_SUBSECTIONS.map((group) => (
                    <SelectItem key={group.key} value={group.key}>
                      {group.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Додати
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
