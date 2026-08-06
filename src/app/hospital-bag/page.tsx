import { householdRepository, itemsRepository, pregnancyRepository } from "@/lib/repositories"
import { SECTIONS, HOSPITAL_BAG_SUBSECTIONS } from "@/lib/sections"
import { SectionChecklist } from "@/components/checklist/section-checklist"
import { getCurrentWeek } from "@/lib/pregnancy"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [items, pregnancy] = await Promise.all([
    itemsRepository.getItemsBySection(household.id, SECTIONS.hospitalBag.id),
    pregnancyRepository.getPregnancy(household.id),
  ])
  const currentWeek = pregnancy ? getCurrentWeek(new Date(pregnancy.due_date)) : null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading italic">{SECTIONS.hospitalBag.title_uk}</h1>
      <SectionChecklist
        sectionId={SECTIONS.hospitalBag.id}
        initialItems={items}
        subsections={HOSPITAL_BAG_SUBSECTIONS}
        currentWeek={currentWeek}
      />
    </div>
  )
}
