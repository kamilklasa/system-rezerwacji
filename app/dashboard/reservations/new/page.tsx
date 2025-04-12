import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ReservationForm } from "@/components/reservations/reservation-form"
import { CalendarPlus } from "lucide-react"
import { redirect } from "next/navigation"

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: { room?: string }
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

  const isAdmin = user.role === "admin"

  // If room ID is provided, verify it exists
  let roomName = null
  let buildingName = null

  if (searchParams.room) {
    const { data: roomData } = await supabase
      .from("rooms")
      .select(`
        name,
        buildings(name)
      `)
      .eq("id", searchParams.room)
      .single()

    if (roomData) {
      roomName = roomData.name
      buildingName = roomData.buildings?.name
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mt-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <CalendarPlus className="mr-3 h-8 w-8 text-primary" />
            Nowa rezerwacja
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {roomName
            ? `Rezerwacja sali ${roomName}${buildingName ? ` w budynku ${buildingName}` : ""}`
            : "Wypełnij formularz, aby zarezerwować salę"}
        </p>
      </div>

      <div className="max-w-3xl">
        <ReservationForm currentUser={user} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
