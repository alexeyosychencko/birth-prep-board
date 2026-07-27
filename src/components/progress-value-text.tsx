"use client"

import { ProgressValue } from "@/components/ui/progress"

type ProgressValueTextProps = {
  value: string
}

export function ProgressValueText({ value }: ProgressValueTextProps) {
  return <ProgressValue>{() => value}</ProgressValue>
}
