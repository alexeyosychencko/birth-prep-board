import type { Contact } from "@/lib/types"

export interface ContactsRepository {
  getContacts(householdId: string): Promise<Contact[]>
  addContact(
    householdId: string,
    id: string,
    name: string,
    role: string | null,
    phone: string | null,
    note: string | null
  ): Promise<Contact>
  updateContactName(householdId: string, contactId: string, name: string): Promise<void>
  updateContactRole(householdId: string, contactId: string, role: string | null): Promise<void>
  updateContactPhone(householdId: string, contactId: string, phone: string | null): Promise<void>
  updateContactNote(householdId: string, contactId: string, note: string | null): Promise<void>
  deleteContact(householdId: string, contactId: string): Promise<void>
}
