import { householdRepository, contactsRepository } from "@/lib/repositories"
import { ContactsList } from "@/components/contacts/contacts-list"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const contacts = await contactsRepository.getContacts(household.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading italic">Контакти</h1>
      <ContactsList initialContacts={contacts} />
    </div>
  )
}
