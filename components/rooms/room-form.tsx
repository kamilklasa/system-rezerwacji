"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Building, Room, RoomEquipment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { BuildingIcon, DoorOpen, Users, SquareIcon, ArrowDown, PenSquare } from "lucide-react"

interface RoomFormProps {
  room?: Room
  equipment?: RoomEquipment[]
}

export function RoomForm({ room, equipment }: RoomFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBuildingId = searchParams.get("building")

  const [isLoading, setIsLoading] = useState(false)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [formData, setFormData] = useState({
    name: room?.name || "",
    building_id: room?.building_id?.toString() || initialBuildingId || "",
    capacity: room?.capacity?.toString() || "",
    floor: room?.floor?.toString() || "",
    area: room?.area?.toString() || "",
    description: room?.description || "",
    equipment: [] as string[],
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

  // Set initial equipment if provided
  useEffect(() => {
    if (equipment && equipment.length > 0) {
      setFormData((prev) => ({
        ...prev,
        equipment: equipment.map((e) => e.name),
      }))
    }
  }, [equipment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEquipmentChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      equipment: checked ? [...prev.equipment, value] : prev.equipment.filter((item) => item !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const roomData = {
        name: formData.name,
        building_id: Number.parseInt(formData.building_id),
        capacity: Number.parseInt(formData.capacity),
        floor: Number.parseInt(formData.floor),
        area: formData.area ? Number.parseFloat(formData.area) : null,
        description: formData.description,
      }

      if (room) {
        // Update existing room
        const { error } = await supabase.from("rooms").update(roomData).eq("id", room.id)

        if (error) throw error

        // Handle equipment updates
        if (equipment) {
          // Delete removed equipment
          const equipmentToDelete = equipment.filter((e) => !formData.equipment.includes(e.name)).map((e) => e.id)

          if (equipmentToDelete.length > 0) {
            await supabase.from("room_equipment").delete().in("id", equipmentToDelete)
          }
        }

        // Add new equipment
        const existingEquipmentNames = equipment?.map((e) => e.name) || []
        const newEquipment = formData.equipment
          .filter((name) => !existingEquipmentNames.includes(name))
          .map((name) => ({
            room_id: room.id,
            name,
          }))

        if (newEquipment.length > 0) {
          await supabase.from("room_equipment").insert(newEquipment)
        }

        toast({
          title: "Sala zaktualizowana",
          description: "Dane sali zostały pomyślnie zaktualizowane.",
        })
      } else {
        // Create new room
        const { data, error } = await supabase.from("rooms").insert([roomData]).select()

        if (error) throw error

        // Add equipment for new room
        if (formData.equipment.length > 0 && data && data[0]) {
          const newRoomId = data[0].id
          const equipmentData = formData.equipment.map((name) => ({
            room_id: newRoomId,
            name,
          }))

          await supabase.from("room_equipment").insert(equipmentData)
        }

        toast({
          title: "Sala dodana",
          description: "Nowa sala została pomyślnie dodana.",
        })
      }

      router.push("/dashboard/rooms")
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

  const commonEquipment = [
    "Projektor",
    "Komputer",
    "System audio",
    "Tablica interaktywna",
    "Tablica suchościeralna",
    "Mikrofon",
    "Klimatyzacja",
    "Internet",
    "Telewizor",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {room ? (
            <>
              <PenSquare className="h-5 w-5 text-primary" />
              Edytuj salę
            </>
          ) : (
            <>
              <DoorOpen className="h-5 w-5 text-primary" />
              Dodaj nową salę
            </>
          )}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              Nazwa sali
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="np. Sala 101, Aula A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_id" className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              Budynek
            </Label>
            <Select
              value={formData.building_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, building_id: value }))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Pojemność (osób)
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="np. 30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                Piętro
              </Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={formData.floor}
                onChange={handleChange}
                placeholder="np. 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="flex items-center gap-2">
                <SquareIcon className="h-4 w-4 text-muted-foreground" />
                Powierzchnia (m²)
              </Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                min="0"
                value={formData.area}
                onChange={handleChange}
                placeholder="np. 50.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Dodatkowe informacje o sali..."
              rows={3}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label className="flex items-center gap-2 mb-3">Wyposażenie</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {commonEquipment.map((item) => (
                <div key={item} className="flex items-center space-x-2 bg-muted/40 p-2 rounded-md">
                  <Checkbox
                    id={`equipment-${item}`}
                    checked={formData.equipment.includes(item)}
                    onCheckedChange={(checked) => handleEquipmentChange(item, checked as boolean)}
                  />
                  <Label htmlFor={`equipment-${item}`} className="cursor-pointer text-sm">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : room ? "Zapisz zmiany" : "Dodaj salę"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
