"use client"

import { SectionError } from "@/components/section-error"

export default function PeopleLogisticsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Люди й логістика" error={error} reset={reset} />
}
