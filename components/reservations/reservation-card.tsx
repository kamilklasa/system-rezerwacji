"use client"

import Link from "next/link"
import type { ReservationWithRoom, User } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Edit, Trash, Users, Building } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
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

interface ReservationCardProps {
  reservation: ReservationWithRoom
  currentUser: User
  onDelete?: (id: number) => void
}

export function ReservationCard({ reservation, currentUser, onDelete }: ReservationCardProps) {
  const isOwner = reservation.user_id === currentUser.id
  const isAdmin = currentUser.role === "admin"
  const canEdit = isOwner || isAdmin
  const isPast = new Date(reservation.end_time) < new Date()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(reservation.id)
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("reservations").delete().eq("id", reservation.id)

      if (error) throw error

      toast({
        title: "Rezerwacja usunięta",
        description: "Rezerwacja została pomyślnie usunięta z systemu.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć rezerwacji",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className={`overflow-hidden transition-all hover:shadow-md ${isPast ? "opacity-75" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{reservation.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {reservation.room?.name || `Sala ID: ${reservation.room_id}`}
                {reservation.room?.building_name && ` (${reservation.room.building_name})`}
              </CardDescription>
            </div>
            <Badge
              variant={isPast ? "outline" : reservation.status === "confirmed" ? "default" : "outline"}
              className={isPast ? "bg-muted" : ""}
            >
              {isPast ? "Zakończona" : reservation.status === "confirmed" ? "Potwierdzona" : reservation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{formatDate(reservation.start_time)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>
              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
            </span>
          </div>
          {reservation.attendees && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>Liczba uczestników: {reservation.attendees}</span>
            </div>
          )}
          {reservation.description && (
            <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{reservation.description}</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 bg-muted/5">
          <Button asChild variant="outline">
            <Link href={`/dashboard/reservations/${reservation.id}`}>Szczegóły</Link>
          </Button>
          {canEdit && !isPast && (
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="icon">
                <Link href={`/dashboard/reservations/edit/${reservation.id}`}>
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
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę rezerwację?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje usunięcie rezerwacji "{reservation.title}" z systemu.
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
