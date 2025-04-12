import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ReservationForm } from "@/components/reservations/reservation-form"

export default async function EditReservationPage({
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

  // Fetch reservation
  const { data: reservation } = await supabase.from("reservations").select("*").eq("id", params.id).single()

  if (!reservation) {
    notFound()
  }

  // Check if user is allowed to edit this reservation
  if (!isAdmin && reservation.user_id !== user.id) {
    return <div className="text-center py-10">Nie masz uprawnień do edycji tej rezerwacji</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edytuj rezerwację</h1>
      <ReservationForm reservation={reservation} currentUser={user} isAdmin={isAdmin} />
    </div>
  )
}
