"use client"

import { SectionError } from "@/components/section-error"

export default function PrintError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Друк" error={error} reset={reset} />
}
