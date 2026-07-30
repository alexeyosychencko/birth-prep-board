import { householdRepository, itemsRepository, pregnancyRepository } from "@/lib/repositories"
import { SECTIONS } from "@/lib/sections"
import { SectionChecklist } from "@/components/checklist/section-checklist"
import { getCurrentWeek } from "@/lib/pregnancy"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [items, pregnancy] = await Promise.all([
    itemsRepository.getItemsBySection(household.id, SECTIONS.home.id),
    pregnancyRepository.getPregnancy(household.id),
  ])
  const currentWeek = pregnancy ? getCurrentWeek(new Date(pregnancy.due_date)) : null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">{SECTIONS.home.title_uk}</h1>
      <SectionChecklist sectionId={SECTIONS.home.id} initialItems={items} currentWeek={currentWeek} />
    </div>
  )
}
