"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Building } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { BuildingIcon, MapPin } from "lucide-react"

interface BuildingFormProps {
  building?: Building
}

export function BuildingForm({ building }: BuildingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(building?.name || "")
  const [address, setAddress] = useState(building?.address || "")
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (building) {
        // Update existing building
        const { error } = await supabase.from("buildings").update({ name, address }).eq("id", building.id)

        if (error) throw error

        toast({
          title: "Budynek zaktualizowany",
          description: "Dane budynku zostały pomyślnie zaktualizowane.",
        })
      } else {
        // Create new building
        const { error } = await supabase.from("buildings").insert([{ name, address }])

        if (error) throw error

        toast({
          title: "Budynek dodany",
          description: "Nowy budynek został pomyślnie dodany.",
        })
      }

      router.push("/dashboard/buildings")
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
    <Card>
      <CardHeader>
        <CardTitle>{building ? "Edytuj budynek" : "Dodaj nowy budynek"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              Nazwa budynku
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Budynek A, Wydział Informatyki"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Adres
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="np. ul. Przykładowa 123, 00-000 Warszawa"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : building ? "Zapisz zmiany" : "Dodaj budynek"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
