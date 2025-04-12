"use client"

import Link from "next/link"
import type { Building } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BuildingIcon, Edit, Trash, MapPin, Calendar } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

interface BuildingCardProps {
  building: Building
  isAdmin: boolean
  onDelete?: (id: number) => void
}

export function BuildingCard({ building, isAdmin, onDelete }: BuildingCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(building.id)
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("buildings").delete().eq("id", building.id)

      if (error) throw error

      toast({
        title: "Budynek usunięty",
        description: "Budynek został pomyślnie usunięty z systemu.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć budynku",
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
              <CardTitle className="text-xl">{building.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {building.address}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5">
              <BuildingIcon className="h-3.5 w-3.5 mr-1.5" />
              Budynek
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Utworzono: {new Date(building.created_at).toLocaleDateString("pl-PL")}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 bg-muted/5">
          <Button asChild variant="outline">
            <Link href={`/dashboard/buildings/${building.id}`}>Szczegóły</Link>
          </Button>
          {isAdmin && (
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="icon">
                <Link href={`/dashboard/buildings/edit/${building.id}`}>
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
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten budynek?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje usunięcie budynku "{building.name}" z systemu.
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
