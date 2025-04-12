import { notFound } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Building, Edit, MapPin, DoorOpen, Plus, CalendarDays, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default async function BuildingDetailsPage({
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

  // Fetch building
  const { data: building } = await supabase.from("buildings").select("*").eq("id", params.id).single()

  if (!building) {
    notFound()
  }

  // Fetch rooms in this building
  const { data: rooms } = await supabase.from("rooms").select("*").eq("building_id", building.id).order("name")

  // Fetch upcoming reservations for rooms in this building
  const now = new Date().toISOString()
  const { data: upcomingReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      rooms(name),
      users(full_name)
    `)
    .in(
      "room_id",
      (rooms || []).map((room) => room.id),
    )
    .gte("end_time", now)
    .order("start_time")
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mt-4">
            <h1 className="text-xl font-bold tracking-tight">{building.name}</h1>
            <Badge variant="outline" className="bg-primary/5">
              <Building className="h-3.5 w-3.5 mr-1.5" />
              Budynek
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {building.address}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/buildings/edit/${building.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild>
              <Link href={`/dashboard/rooms/new?building=${building.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj salę
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Sale</TabsTrigger>
          <TabsTrigger value="reservations">Rezerwacje</TabsTrigger>
          <TabsTrigger value="details">Szczegóły</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sale w budynku</CardTitle>
              <CardDescription>Lista sal dostępnych w budynku {building.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {rooms && rooms.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((room) => (
                    <Card key={room.id} className="overflow-hidden transition-all hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">Piętro {room.floor}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Pojemność: </span>
                            <strong>{room.capacity} osób</strong>
                          </div>
                          {room.area && (
                            <div>
                              <span className="text-muted-foreground">Powierzchnia: </span>
                              <strong>{room.area} m²</strong>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t p-4 bg-muted/5">
                        <Button asChild variant="outline">
                          <Link href={`/dashboard/rooms/${room.id}`}>Szczegóły</Link>
                        </Button>
                        <Button asChild variant="default" size="sm">
                          <Link href={`/dashboard/reservations/new?room=${room.id}`}>
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Zarezerwuj
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DoorOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Brak sal w tym budynku</p>
                  {isAdmin && (
                    <Button asChild className="mt-4">
                      <Link href={`/dashboard/rooms/new?building=${building.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj pierwszą salę
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nadchodzące rezerwacje</CardTitle>
              <CardDescription>Lista nadchodzących rezerwacji w budynku {building.name}</CardDescription>
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
                            Sala: {reservation.rooms?.name || "Nieznana"} | Prowadzący:{" "}
                            {reservation.users?.full_name || "Nieznany"}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/reservations/${reservation.id}`}>Szczegóły</Link>
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formatDate(reservation.start_time)} |{" "}
                        {new Date(reservation.start_time).toLocaleTimeString("pl-PL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(reservation.end_time).toLocaleTimeString("pl-PL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Brak nadchodzących rezerwacji w tym budynku</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informacje o budynku</CardTitle>
              <CardDescription>Szczegółowe informacje o budynku {building.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Nazwa budynku
                    </h3>
                    <p className="text-md font-medium">{building.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Adres
                    </h3>
                    <p className="text-md font-medium">{building.address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <DoorOpen className="h-4 w-4 mr-2" />
                      Liczba sal
                    </h3>
                    <p className="text-md font-medium">{rooms?.length || 0}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Data dodania
                    </h3>
                    <p className="text-md font-medium">{formatDate(building.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter className="border-t pt-6">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/buildings/edit/${building.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edytuj budynek
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
