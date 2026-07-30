"use client"

import { SectionError } from "@/components/section-error"

export default function WeeksError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Тижні пунктів" error={error} reset={reset} />
}
