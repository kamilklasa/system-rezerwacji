"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AtSign, UserIcon, Shield } from "lucide-react"

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState(user.full_name || "")
  const supabase = getSupabaseBrowserClient()

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profil zaktualizowany",
        description: "Twoje dane zostały pomyślnie zaktualizowane.",
      })

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
        <CardTitle className="text-lg">Twój profil</CardTitle>
        <CardDescription className="-mt-1">Zarządzaj swoimi danymi osobowymi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage className="h-13 w-13"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
              alt={user.full_name}
            />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-md font-medium">{user.full_name}</h3>
            <p className="text-xs -mt-1 text-muted-foreground">{user.role === "admin" ? "Administrator" : "Wykładowca"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center  gap-2">
                <AtSign className="h-4 w-4  text-muted-foreground" />
                Email
              </Label>
              <Input id="email" value={user.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Adres email nie może być zmieniony</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Imię i nazwisko
              </Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Rola
              </Label>
              <Input
                id="role"
                value={user.role === "admin" ? "Administrator" : "Wykładowca"}
                disabled
                className="bg-muted/50"
              />
            </div>

         
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
           
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
