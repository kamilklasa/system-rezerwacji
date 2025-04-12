import { notFound, redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BuildingForm } from "@/components/buildings/building-form"
import { Building } from "lucide-react"

export default async function EditBuildingPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getSupabaseServerClient()

  // Fetch user data
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  const user = userData || {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || "",
    role: "lecturer",
  }

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch building
  const { data: building } = await supabase.from("buildings").select("*").eq("id", params.id).single()

  if (!building) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Building className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Edytuj budynek</h1>
      </div>
      <p className="text-muted-foreground mb-6">Zaktualizuj informacje o budynku {building.name}.</p>
      <BuildingForm building={building} />
    </div>
  )
}
