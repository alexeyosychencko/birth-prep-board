import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { navItems } from "@/lib/nav-items"
import type { Section } from "@/lib/types"

export function SectionGrid({
  sections,
}: {
  sections: { section: Section; done: number; total: number }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {sections.map(({ section, done, total }) => {
        const href = `/${section.key}`
        const navItem = navItems.find((item) => item.href === href)
        const progress = total > 0 ? (done / total) * 100 : 0

        return (
          <Link key={section.id} href={href} className="block">
            <Card size="sm" className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {navItem && (
                    <HugeiconsIcon
                      icon={navItem.icon}
                      strokeWidth={2}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span className="truncate">{section.title_uk}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Progress value={progress} />
                <p className="font-mono text-xs text-muted-foreground tabular-nums">{`${done} з ${total}`}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
