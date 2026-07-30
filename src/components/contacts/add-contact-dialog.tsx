"use client"

import { useState, useTransition, type FormEvent } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createContactAction,
  updateContactNameAction,
  updateContactRoleAction,
  updateContactPhoneAction,
  updateContactNoteAction,
} from "@/lib/actions/contacts-actions"
import type { Contact } from "@/lib/types"

export function AddContactDialog({
  contact,
  triggerVariant,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onSaved,
}: {
  contact?: Contact
  triggerVariant?: "default" | "outline"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: (contact: Contact) => void
}) {
  const path = usePathname()
  const isEdit = !!contact
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isEdit ? (openProp ?? false) : internalOpen
  const setOpen = isEdit ? (onOpenChangeProp ?? (() => {})) : setInternalOpen
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const name = String(formData.get("name") ?? "").trim()
    if (!name) return
    const role = String(formData.get("role") ?? "").trim() || null
    const phone = String(formData.get("phone") ?? "").trim() || null
    const note = String(formData.get("note") ?? "").trim() || null

    setOpen(false)

    if (contact) {
      const updated: Contact = { ...contact, name, role, phone, note }
      startTransition(async () => {
        onSaved?.(updated)
        try {
          await Promise.all([
            updateContactNameAction(path, contact.id, name),
            updateContactRoleAction(path, contact.id, role),
            updateContactPhoneAction(path, contact.id, phone),
            updateContactNoteAction(path, contact.id, note),
          ])
        } catch {
          toast.error("Не вдалось зберегти контакт. Спробуйте ще раз.")
        }
      })
      return
    }

    const id = crypto.randomUUID()
    startTransition(async () => {
      onSaved?.({
        id,
        household_id: "",
        name,
        role,
        phone,
        note,
        sort_order: Number.MAX_SAFE_INTEGER,
        created_at: new Date().toISOString(),
      })
      try {
        await createContactAction(path, id, name, role, phone, note)
      } catch {
        toast.error("Не вдалось додати контакт. Спробуйте ще раз.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger render={<Button variant={triggerVariant} size="sm" className="self-start" />}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Додати контакт
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редагувати контакт" : "Новий контакт"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Ім&apos;я</Label>
            <Input id="name" name="name" required autoFocus defaultValue={contact?.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Роль (опціонально)</Label>
            <Input
              id="role"
              name="role"
              placeholder="напр. лікар, пологовий будинок, таксі, хто забирає собаку"
              defaultValue={contact?.role ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Телефон (опціонально)</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Нотатка (опціонально)</Label>
            <Textarea id="note" name="note" defaultValue={contact?.note ?? ""} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Зберегти" : "Додати"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
