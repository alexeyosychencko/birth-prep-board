import { normalizePhoneHref } from "@/components/contacts/phone-field"
import type { Contact } from "@/lib/types"

export function PrintContacts({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-heading font-medium">Контакти</h2>
      {contacts.length === 0 ? (
        <p className="text-sm">Контакти не додані.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 print:break-inside-avoid">
              <span className="text-base font-medium">{contact.name}</span>
              {contact.role && <span className="text-sm">{contact.role}</span>}
              {contact.phone && (
                <a href={normalizePhoneHref(contact.phone)} className="ml-auto font-mono text-lg font-semibold">
                  {contact.phone}
                </a>
              )}
              {contact.note && <p className="w-full text-sm whitespace-pre-wrap">{contact.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
