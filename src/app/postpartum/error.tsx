"use client"

import { SectionError } from "@/components/section-error"

export default function PostpartumError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Післяпологовий період" error={error} reset={reset} />
}
