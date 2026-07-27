"use client"

import { ProgressValue } from "@/components/ui/progress"

interface WeekProgressValueProps {
  value: string
}

export function WeekProgressValue({ value }: WeekProgressValueProps) {
  return <ProgressValue>{() => value}</ProgressValue>
}
