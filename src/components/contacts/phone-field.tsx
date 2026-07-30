export function normalizePhoneHref(phone: string): string {
  return `tel:${phone.replace(/[\s()-]/g, "")}`
}

export function PhoneField({ phone }: { phone: string | null }) {
  if (!phone) return null

  return (
    <a
      href={normalizePhoneHref(phone)}
      className="shrink-0 text-sm text-muted-foreground hover:text-foreground hover:underline"
    >
      {phone}
    </a>
  )
}
