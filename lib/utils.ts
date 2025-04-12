import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)}, ${formatTime(date)}`
}

export function isOverlapping(start1: string | Date, end1: string | Date, start2: string | Date, end2: string | Date) {
  const s1 = new Date(start1).getTime()
  const e1 = new Date(end1).getTime()
  const s2 = new Date(start2).getTime()
  const e2 = new Date(end2).getTime()

  return s1 < e2 && e1 > s2
}
