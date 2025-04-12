import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { RoomWithEquipment } from "@/lib/types"
import { RoomCard } from "@/components/rooms/room-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, DoorOpen } from "lucide-react"

export default async function RoomsPage() {
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

  // Fetch rooms with buildings
  const { data: rooms } = await supabase
    .from("rooms")
    .select(`
      *,
      buildings(name)
    `)
    .order("name")

  // Fetch equipment for each room
  const { data: equipment } = await supabase.from("room_equipment").select("*")

  // Combine rooms with their equipment
  const roomsWithEquipment: RoomWithEquipment[] = (rooms || []).map((room: any) => ({
    ...room,
    building_name: room.buildings?.name,
    equipment: (equipment || []).filter((e) => e.room_id === room.id),
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        
          <h1 className="text-2xl mt-4 font-bold tracking-tight flex items-center">
           <DoorOpen className="mr-3 h-8 w-8 text-primary" />
            Sale
        </h1>
          <p className="text-muted-foreground mt-1 text-sm">Zarządzaj salami wykładowymi w systemie</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj salę
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roomsWithEquipment && roomsWithEquipment.length > 0 ? (
          roomsWithEquipment.map((room) => <RoomCard key={room.id} room={room} isAdmin={isAdmin} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-lg border">
            <DoorOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">Brak sal w systemie</h3>
            <p className="text-muted-foreground mb-6">Dodaj pierwszą salę, aby rozpocząć</p>
            {isAdmin && (
              <Button asChild>
                <Link href="/dashboard/rooms/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pierwszą salę
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
