"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function SectionError({
  title,
  error,
  reset,
}: {
  title: string
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-heading font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">Не вдалось завантажити розділ. Спробуйте ще раз.</p>
      <Button variant="outline" onClick={() => reset()} className="self-start">
        Спробувати ще раз
      </Button>
    </div>
  )
}
