"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { AtSign, KeyRound, User, CalendarDays } from "lucide-react"

export function AuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const supabase = getSupabaseBrowserClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Zalogowano pomyślnie",
        description: "Przekierowujemy do panelu...",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Błąd logowania",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Konto utworzone",
        description: "Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.",
      })
    } catch (error: any) {
      toast({
        title: "Błąd rejestracji",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-2">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">System Rezerwacji Sal</CardTitle>
        <CardDescription className="text-center">
          Zaloguj się lub utwórz konto, aby zarządzać rezerwacjami sal wykładowych
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Logowanie</TabsTrigger>
          <TabsTrigger value="register">Rejestracja</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Hasło
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Imię i nazwisko
                </Label>
                <Input
                  id="fullName"
                  placeholder="Jan Kowalski"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Hasło
                </Label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Rejestracja..." : "Zarejestruj się"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
