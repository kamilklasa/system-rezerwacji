import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/settings/profile-form"
import { SettingsIcon } from "lucide-react"

export default async function SettingsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mt-4 font-bold tracking-tight flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
          Ustawienia
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Zarządzaj swoim kontem i preferencjami</p>
      </div>

      <div className="max-w-full">
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
