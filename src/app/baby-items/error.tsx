"use client"

import { SectionError } from "@/components/section-error"

export default function BabyItemsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Речі для малюка" error={error} reset={reset} />
}
