import type React from "react"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  const user = userData || {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || "",
    role: "lecturer",
  }

  return (
    <div className="flex min-h-screen flex-col">
     
      <div className="flex flex-1">
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
        <main className="flex-1 md:ml-[270px] pt-4 px-4 md:px-8 pb-16">{children}</main>
      </div>
    </div>
  )
}
