import { householdRepository, itemsRepository } from "@/lib/repositories"
import { SECTIONS } from "@/lib/sections"
import { SectionChecklist } from "@/components/checklist/section-checklist"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const items = await itemsRepository.getItemsBySection(household.id, SECTIONS.peopleLogistics.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">{SECTIONS.peopleLogistics.title_uk}</h1>
      <SectionChecklist sectionId={SECTIONS.peopleLogistics.id} initialItems={items} />
    </div>
  )
}
