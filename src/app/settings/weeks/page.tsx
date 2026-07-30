import { householdRepository, itemsRepository } from "@/lib/repositories"
import { SECTIONS_LIST } from "@/lib/sections"
import { WeeksEditor } from "@/components/settings/weeks-editor"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const items = await itemsRepository.getAllItems(household.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Тижні пунктів</h1>
      <WeeksEditor items={items} sections={SECTIONS_LIST} />
    </div>
  )
}
