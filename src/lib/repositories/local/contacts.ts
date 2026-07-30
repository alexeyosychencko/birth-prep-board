import "server-only"
import { readStore, writeStore } from "./store"
import type { ContactsRepository } from "@/lib/repositories/contacts"
import type { Contact } from "@/lib/types"

function assertOwnedContact(contacts: Record<string, Contact>, householdId: string, contactId: string): Contact {
  const contact = contacts[contactId]
  if (!contact || contact.household_id !== householdId) {
    throw new Error(`Contact ${contactId} not found in household ${householdId}`)
  }
  return contact
}

export const contactsRepository: ContactsRepository = {
  async getContacts(householdId) {
    return readStore((store) =>
      Object.values(store.contacts)
        .filter((contact) => contact.household_id === householdId)
        .sort((a, b) => a.sort_order - b.sort_order)
    )
  },

  async addContact(householdId, id, name, role, phone, note) {
    return writeStore((store) => {
      const siblings = Object.values(store.contacts).filter((contact) => contact.household_id === householdId)
      const nextSortOrder = siblings.reduce((max, contact) => Math.max(max, contact.sort_order), 0) + 1

      const contact: Contact = {
        id,
        household_id: householdId,
        name,
        role,
        phone,
        note,
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
      }
      store.contacts[contact.id] = contact
      return contact
    })
  },

  async updateContactName(householdId, contactId, name) {
    await writeStore((store) => {
      const contact = assertOwnedContact(store.contacts, householdId, contactId)
      contact.name = name
    })
  },

  async updateContactRole(householdId, contactId, role) {
    await writeStore((store) => {
      const contact = assertOwnedContact(store.contacts, householdId, contactId)
      contact.role = role
    })
  },

  async updateContactPhone(householdId, contactId, phone) {
    await writeStore((store) => {
      const contact = assertOwnedContact(store.contacts, householdId, contactId)
      contact.phone = phone
    })
  },

  async updateContactNote(householdId, contactId, note) {
    await writeStore((store) => {
      const contact = assertOwnedContact(store.contacts, householdId, contactId)
      contact.note = note
    })
  },

  async deleteContact(householdId, contactId) {
    await writeStore((store) => {
      assertOwnedContact(store.contacts, householdId, contactId)
      delete store.contacts[contactId]
    })
  },
}
