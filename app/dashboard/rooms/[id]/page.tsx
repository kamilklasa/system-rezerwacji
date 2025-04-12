import { notFound } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  Building,
  CalendarDays,
  DoorOpen,
  Edit,
  Users,
  MapPin,
  SquareIcon as SquareFeet,
  Ruler,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatTime } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { RoomEquipmentList } from "@/components/rooms/room-equipment-list"

export default async function RoomDetailsPage({
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

  // Fetch room with building
  const { data: room } = await supabase
    .from("rooms")
    .select(`
      *,
      buildings(*)
    `)
    .eq("id", params.id)
    .single()

  if (!room) {
    notFound()
  }

  // Fetch equipment for the room
  const { data: equipment } = await supabase.from("room_equipment").select("*").eq("room_id", room.id).order("name")

  // Fetch upcoming reservations for this room
  const now = new Date().toISOString()
  const { data: upcomingReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      users(full_name, email)
    `)
    .eq("room_id", room.id)
    .gte("end_time", now)
    .order("start_time")
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mt-4">
            <h1 className="text-xl font-bold tracking-tight">{room.name}</h1>
            
          </div>
          <p className="text-muted-foreground text-sm mt-1 flex items-center">
            <Building className="h-4 w-4 mr-2" />
            {room.buildings?.name || "Budynek nieznany"}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/rooms/edit/${room.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/reservations/new?room=${room.id}`}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Zarezerwuj
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Szczegóły</TabsTrigger>
          <TabsTrigger value="equipment">Wyposażenie</TabsTrigger>
          <TabsTrigger value="reservations">Rezerwacje</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader className="">
              <CardTitle className="text-md">Informacje o sali</CardTitle>
              <CardDescription className="text-sm">Szczegółowe informacje o sali {room.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Lokalizacja
                    </h3>
                    <p className="text-md font-medium">
                      {room.buildings?.name}, piętro {room.floor}
                    </p>
                    {room.buildings?.address && (
                      <p className="text-sm text-muted-foreground">{room.buildings.address}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Pojemność
                    </h3>
                    <p className="text-md font-medium">{room.capacity} osób</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {room.area && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                        <SquareFeet className="h-4 w-4 mr-2" />
                        Powierzchnia
                      </h3>
                      <p className="text-md font-medium">{room.area} m²</p>
                    </div>
                  )}

                  {(room.width || room.height) && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                        <Ruler className="h-4 w-4 mr-2" />
                        Wymiary
                      </h3>
                      <p className="text-lg font-medium">
                        {room.width ? `${room.width}m` : ""} {room.width && room.height ? "×" : ""}{" "}
                        {room.height ? `${room.height}m` : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {room.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Opis
                  </h3>
                  <p className="text-sm">{room.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Wyposażenie sali</CardTitle>
              <CardDescription>Lista dostępnego wyposażenia w sali {room.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <RoomEquipmentList equipment={equipment || []} />
            </CardContent>
            {isAdmin && (
              <CardFooter className="border-t pt-6">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/rooms/edit/${room.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edytuj wyposażenie
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nadchodzące rezerwacje</CardTitle>
              <CardDescription>Lista nadchodzących rezerwacji dla sali {room.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations && upcomingReservations.length > 0 ? (
                <div className="space-y-6">
                  {upcomingReservations.map((reservation: any) => (
                    <div key={reservation.id} className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reservation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Prowadzący: {reservation.users?.full_name || "Nieznany"}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/reservations/${reservation.id}`}>Szczegóły</Link>
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formatDate(reservation.start_time)} | {formatTime(reservation.start_time)} -{" "}
                        {formatTime(reservation.end_time)}
                      </div>
                      {reservation.attendees && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          Liczba uczestników: {reservation.attendees}
                        </div>
                      )}
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Brak nadchodzących rezerwacji dla tej sali</p>
                  <Button asChild className="mt-4">
                    <Link href={`/dashboard/reservations/new?room=${room.id}`}>Zarezerwuj salę</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
