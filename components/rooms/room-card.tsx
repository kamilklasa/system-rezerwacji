"use client"

import Link from "next/link"
import type { RoomWithEquipment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DoorOpen, Edit, Trash, Users, Building, CalendarDays } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: RoomWithEquipment
  isAdmin: boolean
  onDelete?: (id: number) => void
}

export function RoomCard({ room, isAdmin, onDelete }: RoomCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(room.id)
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", room.id)

      if (error) throw error

      toast({
        title: "Sala usunięta",
        description: "Sala została pomyślnie usunięta z systemu.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć sali",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{room.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {room.building_name || room.building || `Budynek ID: ${room.building_id}`}
              </CardDescription>
            </div>
           
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-3">
          <div className="flex items-center pt-6">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              Pojemność: <strong>{room.capacity}</strong> osób
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Piętro: </span>
              <strong>{room.floor}</strong>
            </div>
            {room.area && (
              <div>
                <span className="text-muted-foreground">Powierzchnia: </span>
                <strong>{room.area} m²</strong>
              </div>
            )}
          </div>
          {room.equipment && room.equipment.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 py-2">
              {room.equipment.slice(0, 3).map((item) => (
                <Badge key={item.id} variant="outline" className="bg-primary/5">
                  {item.name}
                </Badge>
              ))}
              {room.equipment.length > 3 && (
                <Badge variant="outline" className="bg-primary/5">
                  +{room.equipment.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex w-full justify-between border-t p-4 bg-muted/5">
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/rooms/${room.id}`}>Szczegóły</Link>
            </Button>
            <Button asChild variant="default" size="icon" className="w-auto px-3">
              <Link href={`/dashboard/reservations/new?room=${room.id}`}>
                <CalendarDays className="h-4 w-4" />
                Zarezerwuj
              </Link>
            </Button>
          </div>
          {isAdmin && (
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="icon">
                <Link href={`/dashboard/rooms/edit/${room.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę salę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje usunięcie sali "{room.name}" z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
