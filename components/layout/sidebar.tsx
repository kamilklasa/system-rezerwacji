"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@/lib/types"
import { Building, CalendarDays, Settings, DoorOpen, LogOut, LayoutDashboard, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  user: User | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const isAdmin = user?.role === "admin"

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Wylogowano pomyślnie",
    })
    router.push("/")
    router.refresh()
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/reservations",
      label: "Rezerwacje",
      icon: CalendarDays,
      active: pathname.startsWith("/dashboard/reservations"),
    },
    {
      href: "/dashboard/buildings",
      label: "Budynki",
      icon: Building,
      active: pathname.startsWith("/dashboard/buildings"),
    },
    {
      href: "/dashboard/rooms",
      label: "Sale",
      icon: DoorOpen,
      active: pathname.startsWith("/dashboard/rooms"),
    },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/admin",
            label: "Admin",
            icon: Users,
            active: pathname.startsWith("/dashboard/admin"),
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      label: "Ustawienia",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  return (
    <div className="group fixed inset-y-0 flex h-full flex-col border-r bg-background data-[collapsed=true]:w-[60px] md:data-[collapsed=true]:w-16 w-[270px] transition-all">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
     
          <span className="text-md font-bold">Merito</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => {
            const Icon = route.icon
            return (
              <Button
                key={i}
                asChild
                variant={route.active ? "secondary" : "ghost"}
                className="justify-start h-10"
                size="sm"
              >
                <Link href={route.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
      {user && (
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-2 mb-4">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                alt={user.full_name}
              />
              <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {user.role === "admin" ? "Administrator" : "Wykładowca"}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Wyloguj się
          </Button>
        </div>
      )}
    </div>
  )
}
