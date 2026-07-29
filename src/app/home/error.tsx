"use client"

import { SectionError } from "@/components/section-error"

export default function HomeSectionError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Дім" error={error} reset={reset} />
}
