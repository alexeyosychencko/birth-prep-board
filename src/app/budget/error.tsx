"use client"

import { SectionError } from "@/components/section-error"

export default function BudgetError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Бюджет" error={error} reset={reset} />
}
