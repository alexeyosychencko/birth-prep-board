"use client"

import { SectionError } from "@/components/section-error"

export default function HospitalBagError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Сумка в пологовий" error={error} reset={reset} />
}
