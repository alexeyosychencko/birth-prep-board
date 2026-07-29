"use client"

import { Button } from "@/components/ui/button"

export default function PostpartumError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-heading font-semibold">Післяпологовий період</h1>
      <p className="text-sm text-muted-foreground">Не вдалось завантажити розділ. Спробуйте ще раз.</p>
      <Button variant="outline" onClick={() => reset()} className="self-start">
        Спробувати ще раз
      </Button>
    </div>
  )
}
