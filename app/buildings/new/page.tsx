import { redirect } from "next/navigation"

export default function RedirectToNewBuilding() {
  redirect("/dashboard/buildings/new")
}
