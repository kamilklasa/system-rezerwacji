"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Building, Room, Reservation, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { isOverlapping } from "@/lib/utils"
import { Text, AlignLeft, BuildingIcon, DoorOpen, CalendarDays, Users } from "lucide-react"

interface ReservationFormProps {
  reservation?: Reservation
  currentUser: User
  isAdmin: boolean
}

export function ReservationForm({ reservation, currentUser, isAdmin }: ReservationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoomId = searchParams.get("room")

  const [isLoading, setIsLoading] = useState(false)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([])
  const [lecturers, setLecturers] = useState<User[]>([])

  const [formData, setFormData] = useState({
    title: reservation?.title || "",
    description: reservation?.description || "",
    building_id: "",
    room_id: reservation?.room_id?.toString() || initialRoomId || "",
    user_id: reservation?.user_id || currentUser.id,
    start_date: reservation
      ? new Date(reservation.start_time).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    start_time: reservation ? new Date(reservation.start_time).toISOString().substring(11, 16) : "08:00",
    end_date: reservation
      ? new Date(reservation.end_time).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    end_time: reservation ? new Date(reservation.end_time).toISOString().substring(11, 16) : "09:00",
    attendees: reservation?.attendees?.toString() || "",
  })

  const supabase = getSupabaseBrowserClient()

  // Fetch buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      const { data, error } = await supabase.from("buildings").select("*").order("name")

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy budynków",
          variant: "destructive",
        })
        return
      }

      setBuildings(data || [])
    }

    fetchBuildings()
  }, [supabase])

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("name")

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy sal",
          variant: "destructive",
        })
        return
      }

      setRooms(data || [])

      // If editing or room is specified in URL, set the building_id based on the room
      if ((reservation || initialRoomId) && data) {
        const roomId = reservation?.room_id || Number(initialRoomId)
        const room = data.find((r) => r.id === roomId)
        if (room) {
          setFormData((prev) => ({
            ...prev,
            building_id: room.building_id.toString(),
            room_id: roomId.toString(),
          }))
          setFilteredRooms(data.filter((r) => r.building_id === room.building_id))
        }
      }
    }

    fetchRooms()
  }, [supabase, reservation, initialRoomId])

  // Fetch existing reservations
  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase.from("reservations").select("*")

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy rezerwacji",
          variant: "destructive",
        })
        return
      }

      setExistingReservations(data || [])
    }

    fetchReservations()
  }, [supabase])

  // Fetch lecturers if admin
  useEffect(() => {
    if (isAdmin) {
      const fetchLecturers = async () => {
        const { data, error } = await supabase.from("users").select("*").order("full_name")

        if (error) {
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać listy wykładowców",
            variant: "destructive",
          })
          return
        }

        setLecturers(data || [])
      }

      fetchLecturers()
    }
  }, [supabase, isAdmin])

  // Filter rooms by building
  useEffect(() => {
    if (formData.building_id) {
      const buildingId = Number.parseInt(formData.building_id)
      setFilteredRooms(rooms.filter((room) => room.building_id === buildingId))
    } else {
      setFilteredRooms([])
    }
  }, [formData.building_id, rooms])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate dates and times
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`)
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}:00`)

      if (endDateTime <= startDateTime) {
        throw new Error("Czas zakończenia musi być późniejszy niż czas rozpoczęcia")
      }

      // Check for overlapping reservations
      const roomId = Number.parseInt(formData.room_id)
      const overlappingReservation = existingReservations.find(
        (r) =>
          r.room_id === roomId &&
          (reservation ? r.id !== reservation.id : true) &&
          isOverlapping(startDateTime, endDateTime, new Date(r.start_time), new Date(r.end_time)),
      )

      if (overlappingReservation) {
        throw new Error("Sala jest już zarezerwowana w tym czasie")
      }

      const reservationData = {
        title: formData.title,
        description: formData.description,
        room_id: roomId,
        user_id: formData.user_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        attendees: formData.attendees ? Number.parseInt(formData.attendees) : null,
        status: "confirmed",
      }

      if (reservation) {
        // Update existing reservation
        const { error } = await supabase.from("reservations").update(reservationData).eq("id", reservation.id)

        if (error) throw error

        toast({
          title: "Rezerwacja zaktualizowana",
          description: "Dane rezerwacji zostały pomyślnie zaktualizowane.",
        })
      } else {
        // Create new reservation
        const { error } = await supabase.from("reservations").insert([reservationData])

        if (error) throw error

        toast({
          title: "Rezerwacja dodana",
          description: "Nowa rezerwacja została pomyślnie dodana.",
        })
      }

      router.push("/dashboard/reservations")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Dane rezerwacji</CardTitle>
        <CardDescription>Wprowadź szczegóły rezerwacji</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2 mt-4">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Text className="h-4 w-4 text-muted-foreground" />
              Tytuł rezerwacji
            </Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_id" className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              Budynek
            </Label>
            <Select
              value={formData.building_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  building_id: value,
                  room_id: "", // Reset room when building changes
                }))
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz budynek" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id.toString()}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_id" className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              Sala
            </Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, room_id: value }))}
              disabled={!formData.building_id}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz salę" />
              </SelectTrigger>
              <SelectContent>
                {filteredRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name} (pojemność: {room.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="user_id">Wykładowca</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, user_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz wykładowcę" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer) => (
                    <SelectItem key={lecturer.id} value={lecturer.id}>
                      {lecturer.full_name} ({lecturer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Data rozpoczęcia
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Godzina rozpoczęcia</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end_date" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Data zakończenia
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Godzina zakończenia</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Liczba uczestników
            </Label>
            <Input
              id="attendees"
              name="attendees"
              type="number"
              min="1"
              value={formData.attendees}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              Opis
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : reservation ? "Zapisz zmiany" : "Dodaj rezerwację"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
