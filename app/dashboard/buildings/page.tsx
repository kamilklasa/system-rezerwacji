import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Building } from "@/lib/types"
import { BuildingCard } from "@/components/buildings/building-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, BuildingIcon } from "lucide-react"

export default async function BuildingsPage() {
  const supabase = getSupabaseServerClient()

  // Fetch user data
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  const user = userData || {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || "",
    role: "lecturer",
  }

  const isAdmin = user.role === "admin"

  // Fetch buildings
  const { data: buildings } = await supabase.from("buildings").select("*").order("name")

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        
          <h1 className="text-2xl mt-4 font-bold tracking-tight flex items-center">
            <BuildingIcon className="mr-3 h-8 w-8 text-primary" />
            Budynki
        </h1>
          <p className="text-muted-foreground mt-1 text-sm">Zarządzaj budynkami w systemie</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/buildings/new">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj budynek
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {buildings && buildings.length > 0 ? (
          buildings.map((building: Building) => (
            <BuildingCard key={building.id} building={building} isAdmin={isAdmin} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-lg border">
            <BuildingIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">Brak budynków w systemie</h3>
            <p className="text-muted-foreground mb-6">Dodaj pierwszy budynek, aby rozpocząć</p>
            {isAdmin && (
              <Button asChild>
                <Link href="/dashboard/buildings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pierwszy budynek
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
