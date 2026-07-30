"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"

import { navItems, type NavItem } from "@/lib/nav-items"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

function NavGroup({
  label,
  items,
  pathname,
  isMobile,
  setOpenMobile,
}: {
  label: string
  items: NavItem[]
  pathname: string
  isMobile: boolean
  setOpenMobile: (open: boolean) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={pathname === item.href}
              tooltip={item.title}
              onClick={() => {
                if (isMobile) setOpenMobile(false)
              }}
            >
              <HugeiconsIcon icon={item.icon} />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const checklistItems = navItems.filter((item) => item.group === "checklists")
  const otherItems = navItems.filter((item) => item.group === "other")

  return (
    <div className="print:hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <span className="px-2 text-sm font-heading font-semibold">
            Birth Prep Board
          </span>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup
            label="Розділи"
            items={checklistItems}
            pathname={pathname}
            isMobile={isMobile}
            setOpenMobile={setOpenMobile}
          />
          <NavGroup label="Інше" items={otherItems} pathname={pathname} isMobile={isMobile} setOpenMobile={setOpenMobile} />
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
        <SidebarRail className="print:hidden" />
      </Sidebar>
    </div>
  )
}
