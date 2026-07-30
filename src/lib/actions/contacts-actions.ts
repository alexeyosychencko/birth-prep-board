"use server"

import { revalidatePath } from "next/cache"
import { contactsRepository, householdRepository } from "@/lib/repositories"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function trimToNull(value: string | null): string | null {
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export async function createContactAction(
  path: string,
  id: string,
  name: string,
  role: string | null,
  phone: string | null,
  note: string | null
): Promise<void> {
  if (!UUID_RE.test(id)) throw new Error("Invalid contact id")
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error("Name is required")

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.addContact(
    household.id,
    id,
    trimmedName,
    trimToNull(role),
    trimToNull(phone),
    trimToNull(note)
  )
  revalidatePath(path)
}

export async function updateContactNameAction(path: string, contactId: string, name: string): Promise<void> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error("Name is required")

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.updateContactName(household.id, contactId, trimmedName)
  revalidatePath(path)
}

export async function updateContactRoleAction(path: string, contactId: string, role: string | null): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.updateContactRole(household.id, contactId, trimToNull(role))
  revalidatePath(path)
}

export async function updateContactPhoneAction(
  path: string,
  contactId: string,
  phone: string | null
): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.updateContactPhone(household.id, contactId, trimToNull(phone))
  revalidatePath(path)
}

export async function updateContactNoteAction(path: string, contactId: string, note: string | null): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.updateContactNote(household.id, contactId, trimToNull(note))
  revalidatePath(path)
}

export async function deleteContactAction(path: string, contactId: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await contactsRepository.deleteContact(household.id, contactId)
  revalidatePath(path)
}
