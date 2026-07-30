"use client"

import { useState, useOptimistic, useTransition } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddContactDialog } from "@/components/contacts/add-contact-dialog"
import { PhoneField } from "@/components/contacts/phone-field"
import { DragHandle, SortableListProvider, useSortableRow } from "@/components/sortable-list"
import type { Contact } from "@/lib/types"
import { deleteContactAction, reorderContactsAction } from "@/lib/actions/contacts-actions"

type OptimisticAction =
  | { type: "save"; contact: Contact }
  | { type: "delete"; contactId: string }
  | { type: "reorder"; orderedIds: string[] }

function reduceOptimistic(state: Contact[], action: OptimisticAction): Contact[] {
  switch (action.type) {
    case "save": {
      const exists = state.some((contact) => contact.id === action.contact.id)
      return exists
        ? state.map((contact) => (contact.id === action.contact.id ? action.contact : contact))
        : [...state, action.contact]
    }
    case "delete":
      return state.filter((contact) => contact.id !== action.contactId)
    case "reorder": {
      const sortOrderById = new Map(action.orderedIds.map((id, index) => [id, index + 1]))
      return state.map((contact) => {
        const nextSortOrder = sortOrderById.get(contact.id)
        return nextSortOrder === undefined ? contact : { ...contact, sort_order: nextSortOrder }
      })
    }
  }
}

function ContactRow({
  contact,
  isPending,
  onSaved,
  onDelete,
}: {
  contact: Contact
  isPending: boolean
  onSaved: (contact: Contact) => void
  onDelete: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const sortable = useSortableRow(contact.id)

  /* eslint-disable react-hooks/refs -- dnd-kit's useSortable returns setNodeRef/
     attributes/listeners bundled with other data; this rule treats the whole
     object as ref-like and flags every property access, a false positive for
     this documented API. */
  return (
    <li
      ref={sortable.setNodeRef}
      style={sortable.style}
      data-dragging={sortable.isDragging || undefined}
      className="flex items-center gap-3 py-1.5 data-dragging:relative data-dragging:z-10 data-dragging:bg-background"
    >
      <DragHandle attributes={sortable.attributes} listeners={sortable.listeners} />
      {/* eslint-enable react-hooks/refs */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm">{contact.name}</span>
          {contact.role && <span className="truncate text-sm text-muted-foreground">{contact.role}</span>}
        </div>
        {contact.note && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.note}</p>}
      </div>
      <PhoneField phone={contact.phone} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Дії з контактом" disabled={isPending} />}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Редагувати</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            Видалити
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && (
        <AddContactDialog contact={contact} open={editOpen} onOpenChange={setEditOpen} onSaved={onSaved} />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити контакт «{contact.name}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Це незворотна дія. Номер телефону й нотатку відновити не вдасться.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}

export function ContactsList({ initialContacts }: { initialContacts: Contact[] }) {
  const path = usePathname()
  const [optimisticContacts, applyOptimistic] = useOptimistic(initialContacts, reduceOptimistic)
  const [isPending, startTransition] = useTransition()

  function handleSaved(contact: Contact) {
    applyOptimistic({ type: "save", contact })
  }

  function handleDelete(contact: Contact) {
    startTransition(async () => {
      applyOptimistic({ type: "delete", contactId: contact.id })
      try {
        await deleteContactAction(path, contact.id)
      } catch {
        toast.error("Не вдалось видалити контакт. Спробуйте ще раз.")
      }
    })
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      applyOptimistic({ type: "reorder", orderedIds })
      try {
        await reorderContactsAction(path, orderedIds)
      } catch {
        toast.error("Не вдалось зберегти порядок. Спробуйте ще раз.")
      }
    })
  }

  const sorted = optimisticContacts.slice().sort((a, b) => a.sort_order - b.sort_order)

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          Тут зручно тримати всіх, з ким варто швидко зв&apos;язатись під час підготовки й самих пологів: лікар,
          пологовий будинок, таксі, хто забирає собаку.
        </p>
        <AddContactDialog triggerVariant="default" onSaved={handleSaved} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SortableListProvider items={sorted} onReorder={handleReorder}>
        <ul className="flex flex-col gap-1">
          {sorted.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isPending={isPending}
              onSaved={handleSaved}
              onDelete={() => handleDelete(contact)}
            />
          ))}
        </ul>
      </SortableListProvider>
      <AddContactDialog triggerVariant="outline" onSaved={handleSaved} />
    </div>
  )
}
