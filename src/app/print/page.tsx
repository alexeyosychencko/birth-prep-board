import type { Metadata } from "next"
import { householdRepository, pregnancyRepository, contactsRepository, itemsRepository } from "@/lib/repositories"
import { SECTIONS, HOSPITAL_BAG_SUBSECTIONS } from "@/lib/sections"
import { getCurrentWeek } from "@/lib/pregnancy"
import { PrintButton } from "@/components/print/print-button"
import { PrintHeader } from "@/components/print/print-header"
import { PrintContacts } from "@/components/print/print-contacts"
import { PrintChecklistSection } from "@/components/print/print-checklist"

export const metadata: Metadata = {
  title: "Пакет у пологовий",
}

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [pregnancy, contacts, documentsItems, hospitalBagItems] = await Promise.all([
    pregnancyRepository.getPregnancy(household.id),
    contactsRepository.getContacts(household.id),
    itemsRepository.getItemsBySection(household.id, SECTIONS.documents.id),
    itemsRepository.getItemsBySection(household.id, SECTIONS.hospitalBag.id),
  ])
  const currentWeek = pregnancy ? getCurrentWeek(new Date(pregnancy.due_date)) : null

  return (
    <div className="space-y-8">
      <PrintButton />
      <PrintHeader dueDate={pregnancy?.due_date ?? null} currentWeek={currentWeek} printDate={new Date()} />
      <PrintContacts contacts={contacts} />
      <PrintChecklistSection title={SECTIONS.documents.title_uk} items={documentsItems} />
      <PrintChecklistSection
        title={SECTIONS.hospitalBag.title_uk}
        items={hospitalBagItems}
        subsections={HOSPITAL_BAG_SUBSECTIONS}
      />
    </div>
  )
}
