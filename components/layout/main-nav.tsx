"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, CalendarDays, Home, LogOut, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"

interface MainNavProps {
  user: User | null
  onSignOut: () => void
}

export function MainNav({ user, onSignOut }: MainNavProps) {
  const pathname = usePathname()

  const isAdmin = user?.role === "admin"

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/reservations",
      label: "Rezerwacje",
      icon: CalendarDays,
      active: pathname === "/reservations",
    },
    {
      href: "/buildings",
      label: "Budynki",
      icon: Building,
      active: pathname === "/buildings",
    },
    {
      href: "/rooms",
      label: "Sale",
      icon: Users,
      active: pathname === "/rooms",
    },
    {
      href: "/settings",
      label: "Ustawienia",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => {
        const Icon = route.icon

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-black dark:text-white" : "text-muted-foreground",
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {route.label}
          </Link>
        )
      })}

      <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
        <LogOut className="w-4 h-4" />
        <span>Wyloguj</span>
      </Button>
    </nav>
  )
}
