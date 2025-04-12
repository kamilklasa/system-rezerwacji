import { redirect } from "next/navigation"

export default function RedirectToNewReservation() {
  redirect("/dashboard/reservations/new")
}
