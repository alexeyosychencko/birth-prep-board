import Link from "next/link"

import { householdRepository, pregnancyRepository } from "@/lib/repositories"
import { DueDateForm } from "@/components/settings/due-date-form"
import { buttonVariants } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const pregnancy = await pregnancyRepository.getPregnancy(household.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Налаштування</h1>
      {pregnancy ? (
        <DueDateForm initialDueDate={pregnancy.due_date} />
      ) : (
        <p className="text-sm text-muted-foreground">Дані про вагітність не знайдено.</p>
      )}
      <Link href="/settings/weeks" className={buttonVariants({ variant: "outline", className: "self-start" })}>
        Тижні пунктів
      </Link>
    </div>
  )
}
