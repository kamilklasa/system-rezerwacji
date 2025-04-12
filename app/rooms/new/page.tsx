import { redirect } from "next/navigation"

export default function RedirectToNewRoom() {
  redirect("/dashboard/rooms/new")
}
