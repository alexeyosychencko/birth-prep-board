"use client"

import { SectionError } from "@/components/section-error"

export default function DocumentsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Документи" error={error} reset={reset} />
}
