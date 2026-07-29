"use client"

import { SectionError } from "@/components/section-error"

export default function MedicalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Медичне" error={error} reset={reset} />
}
