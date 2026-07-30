import {
  BriefcaseMedicalIcon,
  Wallet01Icon,
  File01Icon,
  TravelBagIcon,
  BabyBottleIcon,
  House01Icon,
  UserGroupIcon,
  HeartPulseIcon,
  Settings01Icon,
  TimelineListIcon,
  ContactBookIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons"

export type NavItem = {
  title: string
  href: string
  icon: typeof File01Icon
  group: "checklists" | "other"
}

export const navItems: NavItem[] = [
  { title: "Дашборд", href: "/", icon: TimelineListIcon, group: "checklists" },
  { title: "Документи", href: "/documents", icon: File01Icon, group: "checklists" },
  { title: "Сумка в пологовий", href: "/hospital-bag", icon: TravelBagIcon, group: "checklists" },
  { title: "Речі для малюка", href: "/baby-items", icon: BabyBottleIcon, group: "checklists" },
  { title: "Дім", href: "/home", icon: House01Icon, group: "checklists" },
  { title: "Медичне", href: "/medical", icon: BriefcaseMedicalIcon, group: "checklists" },
  { title: "Люди й логістика", href: "/people-logistics", icon: UserGroupIcon, group: "checklists" },
  { title: "Післяпологовий період", href: "/postpartum", icon: HeartPulseIcon, group: "checklists" },
  { title: "Контакти", href: "/contacts", icon: ContactBookIcon, group: "other" },
  { title: "Друк", href: "/print", icon: PrinterIcon, group: "other" },
  { title: "Бюджет", href: "/budget", icon: Wallet01Icon, group: "other" },
  { title: "Налаштування", href: "/settings", icon: Settings01Icon, group: "other" },
]
