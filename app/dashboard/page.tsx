import { CardFooter } from "@/components/ui/card"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, CalendarDays, DoorOpen, Users, TrendingUp, Clock, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()

  // Fetch user data
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: userData } = await supabase.from("users").select("*").eq("id", session?.user.id).single()

  const user = userData || {
    id: session?.user.id,
    email: session?.user.email,
    full_name: session?.user.user_metadata?.full_name || "",
    role: "lecturer",
  }

  // Fetch counts
  const { count: buildingsCount } = await supabase.from("buildings").select("*", { count: "exact", head: true })

  const { count: roomsCount } = await supabase.from("rooms").select("*", { count: "exact", head: true })

  const { data: reservations } = await supabase
    .from("reservations")
    .select(`
      *,
      rooms(name, buildings(name))
    `)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  const { count: myReservationsCount } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const isAdmin = user.role === "admin"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          

          <h1 className="text-2xl mt-4 font-bold tracking-tight flex items-center">
           <DoorOpen className="mr-3 h-8 w-8 text-primary" />
            Witaj, {user.full_name}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Oto przegląd Twojego systemu rezerwacji sal</p>
        </div>
        <Button asChild size="default" className="md:w-auto w-full">
          <Link href="/dashboard/reservations/new">
            <CalendarDays className="mr-2 h-4 w-4" />
            Nowa rezerwacja
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budynki</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Łączna liczba budynków w systemie</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/dashboard/buildings">
                  <span>Zobacz budynki</span>
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sale</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Łączna liczba sal wykładowych</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/dashboard/rooms">
                  <span>Przeglądaj sale</span>
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moje rezerwacje</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myReservationsCount || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span>Aktywne rezerwacje</span>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/dashboard/reservations">
                  <span>Moje rezerwacje</span>
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Nadchodzące rezerwacje</TabsTrigger>
          <TabsTrigger value="quick">Szybkie akcje</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Nadchodzące rezerwacje
              </CardTitle>
              <CardDescription>Lista najbliższych rezerwacji w systemie</CardDescription>
            </CardHeader>
            <CardContent>
              {reservations && reservations.length > 0 ? (
                <div className="space-y-6">
                  {reservations.map((reservation: any) => (
                    <div key={reservation.id} className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reservation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {reservation.rooms?.name} ({reservation.rooms?.buildings?.name})
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
                      <div className="border-b border-border/50 pt-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Brak nadchodzących rezerwacji</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/reservations/new">Dodaj rezerwację</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quick">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Szybkie akcje
              </CardTitle>
              <CardDescription>Najczęściej używane funkcje systemu</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Nowa rezerwacja</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 pt-0 text-sm text-muted-foreground">
                  Zarezerwuj salę na wykład lub inne wydarzenie
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/dashboard/reservations/new">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Zarezerwuj
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Przeglądaj sale</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 pt-0 text-sm text-muted-foreground">
                  Zobacz dostępne sale i ich wyposażenie
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/dashboard/rooms">
                      <DoorOpen className="mr-2 h-4 w-4" />
                      Przeglądaj
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Moje rezerwacje</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 pt-0 text-sm text-muted-foreground">
                  Zarządzaj swoimi istniejącymi rezerwacjami
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/dashboard/reservations">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Zarządzaj
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
