import { getSupabaseServerClient } from "@/lib/supabase/server"
import { RoomForm } from "@/components/rooms/room-form"
import { redirect } from "next/navigation"

export default async function NewRoomPage({
  searchParams,
}: {
  searchParams: { building?: string }
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

  // If building ID is provided, verify it exists
  if (searchParams.building) {
    const { data: building } = await supabase.from("buildings").select("name").eq("id", searchParams.building).single()

    if (!building) {
      redirect("/dashboard/buildings")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dodaj nową salę</h1>
      <RoomForm />
    </div>
  )
}
