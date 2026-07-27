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
} from "@hugeicons/core-free-icons"

export type NavItem = {
  title: string
  href: string
  icon: typeof File01Icon
}

export const navItems: NavItem[] = [
  { title: "Дашборд", href: "/", icon: TimelineListIcon },
  { title: "Документи", href: "/documents", icon: File01Icon },
  { title: "Сумка в пологовий", href: "/hospital-bag", icon: TravelBagIcon },
  { title: "Речі для малюка", href: "/baby-items", icon: BabyBottleIcon },
  { title: "Дім", href: "/home", icon: House01Icon },
  { title: "Медичне", href: "/medical", icon: BriefcaseMedicalIcon },
  { title: "Люди й логістика", href: "/people-logistics", icon: UserGroupIcon },
  { title: "Післяпологовий період", href: "/postpartum", icon: HeartPulseIcon },
  { title: "Бюджет", href: "/budget", icon: Wallet01Icon },
  { title: "Налаштування", href: "/settings", icon: Settings01Icon },
]
