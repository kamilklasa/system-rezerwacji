import { notFound, redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { RoomForm } from "@/components/rooms/room-form"
import { DoorOpen } from "lucide-react"

export default async function EditRoomPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getSupabaseServerClient()

  // Fetch user data
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  const user = userData || {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || "",
    role: "lecturer",
  }

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch room
  const { data: room } = await supabase.from("rooms").select("*").eq("id", params.id).single()

  if (!room) {
    notFound()
  }

  // Fetch equipment for the room
  const { data: equipment } = await supabase.from("room_equipment").select("*").eq("room_id", room.id)

  // Fetch building name for display
  const { data: building } = await supabase.from("buildings").select("name").eq("id", room.building_id).single()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <DoorOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Edytuj salę</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Zaktualizuj informacje o sali {room.name} w budynku {building?.name || `ID: ${room.building_id}`}.
      </p>
      <RoomForm room={room} equipment={equipment || []} />
    </div>
  )
}
