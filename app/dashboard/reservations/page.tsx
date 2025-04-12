import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { ReservationWithRoom } from "@/lib/types"
import { ReservationCard } from "@/components/reservations/reservation-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CalendarDays } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ReservationsPage() {
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

  // Fetch all reservations with rooms
  const { data: allReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      room:rooms(*, buildings(name))
    `)
    .order("start_time")

  // Fetch user's reservations with rooms
  const { data: userReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      room:rooms(*, buildings(name))
    `)
    .eq("user_id", user.id)
    .order("start_time")

  // Separate upcoming and past reservations
  const now = new Date().toISOString()

  const upcomingReservations = (allReservations || [])
    .filter((r: any) => r.end_time >= now)
    .map((r: any) => ({
      ...r,
      room: {
        ...r.room,
        building_name: r.room?.buildings?.name,
      },
    }))

  const pastReservations = (allReservations || [])
    .filter((r: any) => r.end_time < now)
    .map((r: any) => ({
      ...r,
      room: {
        ...r.room,
        building_name: r.room?.buildings?.name,
      },
    }))

  const userUpcomingReservations = (userReservations || [])
    .filter((r: any) => r.end_time >= now)
    .map((r: any) => ({
      ...r,
      room: {
        ...r.room,
        building_name: r.room?.buildings?.name,
      },
    }))

  const userPastReservations = (userReservations || [])
    .filter((r: any) => r.end_time < now)
    .map((r: any) => ({
      ...r,
      room: {
        ...r.room,
        building_name: r.room?.buildings?.name,
      },
    }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row  sm:items-center sm:justify-between gap-4">
        <div>
         

          <h1 className="text-2xl mt-4 font-bold tracking-tight flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" />
            Rezerwacje
        </h1>
          <p className="text-muted-foreground text-sm mt-1">Zarządzaj rezerwacjami sal wykładowych</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reservations/new">
            <Plus className="mr-2 h-4 w-4" />
            Nowa rezerwacja
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="my-upcoming" className="bg-white dark:bg-slate-900 rounded-lg border p-1">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="my-upcoming">Moje nadchodzące</TabsTrigger>
          <TabsTrigger value="my-past">Moje archiwalne</TabsTrigger>
         
        </TabsList>

        <TabsContent value="my-upcoming" className="mt-2 mb-2 px-2">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userUpcomingReservations.length > 0 ? (
              userUpcomingReservations.map((reservation: ReservationWithRoom) => (
                <ReservationCard key={reservation.id} reservation={reservation} currentUser={user} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Brak nadchodzących rezerwacji</h3>
                <p className="text-muted-foreground mb-6">Dodaj pierwszą rezerwację, aby rozpocząć</p>
                <Button asChild>
                  <Link href="/dashboard/reservations/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj pierwszą rezerwację
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-past" className="mt-2 mb-2 px-2">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userPastReservations.length > 0 ? (
              userPastReservations.map((reservation: ReservationWithRoom) => (
                <ReservationCard key={reservation.id} reservation={reservation} currentUser={user} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Brak archiwalnych rezerwacji</h3>
                <p className="text-muted-foreground">Twoje archiwalne rezerwacje pojawią się tutaj</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all-upcoming" className="mt-6 px-2">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation: ReservationWithRoom) => (
                <ReservationCard key={reservation.id} reservation={reservation} currentUser={user} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Brak nadchodzących rezerwacji w systemie</h3>
                <p className="text-muted-foreground">Wszystkie nadchodzące rezerwacje pojawią się tutaj</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all-past" className="mt-6 px-2">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastReservations.length > 0 ? (
              pastReservations.map((reservation: ReservationWithRoom) => (
                <ReservationCard key={reservation.id} reservation={reservation} currentUser={user} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Brak archiwalnych rezerwacji w systemie</h3>
                <p className="text-muted-foreground">Wszystkie archiwalne rezerwacje pojawią się tutaj</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
