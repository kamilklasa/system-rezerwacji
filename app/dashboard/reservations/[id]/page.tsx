import { notFound } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Building, CalendarDays, Clock, DoorOpen, Edit, User, Users, MapPin, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export default async function ReservationDetailsPage({
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

  // Fetch reservation with room and user
  const { data: reservation } = await supabase
    .from("reservations")
    .select(`
      *,
      room:rooms(*),
      lecturer:users(*)
    `)
    .eq("id", params.id)
    .single()

  if (!reservation) {
    notFound()
  }

  // Check if user is allowed to edit this reservation
  const canEdit = isAdmin || reservation.user_id === user.id
  const isPast = new Date(reservation.end_time) < new Date()

  // Get building info if room has a building_id
  const building =
    reservation.room && reservation.room.building_id
      ? (await supabase.from("buildings").select("*").eq("id", reservation.room.building_id).single()).data
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mt-4">
            <h1 className="text-xl font-bold tracking-tight">{reservation.title}</h1>
            <Badge
              variant={isPast ? "outline" : reservation.status === "confirmed" ? "default" : "outline"}
              className={isPast ? "bg-muted" : ""}
            >
              {isPast ? "Zakończona" : reservation.status === "confirmed" ? "Potwierdzona" : reservation.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1 flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            {formatDate(reservation.start_time)}
          </p>
        </div>
        <div className="flex gap-3">
          {canEdit && !isPast && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/reservations/edit/${reservation.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/rooms/${reservation.room_id}`}>
              <DoorOpen className="mr-2 h-4 w-4" />
              Zobacz salę
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              Informacje o rezerwacji
            </CardTitle>
            <CardDescription>Szczegóły rezerwacji</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Data
                </h3>
                <p className="text-md font-medium">{formatDate(reservation.start_time)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Godziny
                </h3>
                <p className="text-md font-medium">
                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Wykładowca
              </h3>
              <p className="text-md font-medium">{reservation.lecturer?.full_name || "Brak danych"}</p>
              {reservation.lecturer?.email && (
                <p className="text-sm text-muted-foreground">{reservation.lecturer.email}</p>
              )}
            </div>

            {reservation.attendees && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Liczba uczestników
                </h3>
                <p className="text-md font-medium">{reservation.attendees} osób</p>
              </div>
            )}

            <Separator className="my-2" />

            {reservation.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Opis
                </h3>
                <p className="text-md">{reservation.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Status
              </h3>
              <Badge
                variant={isPast ? "outline" : reservation.status === "confirmed" ? "default" : "outline"}
                className={isPast ? "bg-muted" : ""}
              >
                {isPast ? "Zakończona" : reservation.status === "confirmed" ? "Potwierdzona" : reservation.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <DoorOpen className="h-5 w-5 mr-2 text-primary" />
              Informacje o sali
            </CardTitle>
            <CardDescription>Szczegóły zarezerwowanej sali</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <DoorOpen className="h-4 w-4 mr-2" />
                Sala
              </h3>
              <p className="text-md font-medium">{reservation.room?.name || `Sala ID: ${reservation.room_id}`}</p>
            </div>

            {reservation.room && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Budynek
                  </h3>
                  <p className="text-md font-medium">{building?.name || "Brak danych"}</p>
                  {building?.address && <p className="text-sm text-muted-foreground">{building.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Piętro
                    </h3>
                    <p className="text-md font-medium">{reservation.room?.floor || "Brak danych"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Pojemność
                    </h3>
                    <p className="text-md font-medium">{reservation.room?.capacity || "Brak danych"} osób</p>
                  </div>
                </div>
              </>
            )}

            <Separator className="my-2" />

            <div className="pt-2 flex gap-3">
              <Button asChild variant="outline">
                <Link href={`/dashboard/rooms/${reservation.room_id}`}>
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Szczegóły sali
                </Link>
              </Button>
              {reservation.room && reservation.room.building_id && (
                <Button asChild variant="outline">
                  <Link href={`/dashboard/buildings/${reservation.room.building_id}`}>
                    <Building className="mr-2 h-4 w-4" />
                    Szczegóły budynku
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/reservations">Powrót do listy</Link>
        </Button>
        {canEdit && !isPast && (
          <Button asChild variant="default">
            <Link href={`/dashboard/reservations/edit/${reservation.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edytuj rezerwację
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
