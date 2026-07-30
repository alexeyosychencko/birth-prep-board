"use client"

import { SectionError } from "@/components/section-error"

export default function ContactsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SectionError title="Контакти" error={error} reset={reset} />
}
