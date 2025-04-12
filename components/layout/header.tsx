"use client"

import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { UserNav } from "@/components/layout/user-nav"
import type { User } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Wylogowano pomyślnie",
    })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="w-full flex-1 md:grow-0">Rezerwacja sal</div>

      <div className="flex items-center gap-2 ml-auto">
        <ModeToggle />
        <Button variant="outline" size="icon" className="rounded-full">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Powiadomienia</span>
        </Button>
        <UserNav user={user} onSignOut={handleSignOut} />
      </div>
    </header>
  )
}
