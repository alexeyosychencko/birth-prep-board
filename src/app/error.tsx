"use client"

import { SectionError } from "@/components/section-error"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Дашборд" error={error} reset={reset} />
}
