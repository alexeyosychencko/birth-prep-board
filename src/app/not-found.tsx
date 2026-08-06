import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-heading italic">Сторінку не знайдено</h1>
      <p className="text-sm text-muted-foreground">
        Такого розділу не існує або він був переміщений.
      </p>
      <Link href="/" className={buttonVariants({ className: "self-start" })}>
        На дашборд
      </Link>
    </div>
  )
}
