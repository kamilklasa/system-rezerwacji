import { Laptop, Monitor, Mic, Music, Wifi, Tv, Thermometer, PenTool, CheckCircle2 } from "lucide-react"
import type { RoomEquipment } from "@/lib/types"

interface RoomEquipmentListProps {
  equipment: RoomEquipment[]
}

export function RoomEquipmentList({ equipment }: RoomEquipmentListProps) {
  if (!equipment || equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Brak informacji o wyposażeniu sali</p>
      </div>
    )
  }

  // Map equipment names to icons
  const getEquipmentIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("komputer") || lowerName.includes("laptop")) return Laptop
    if (lowerName.includes("projektor") || lowerName.includes("monitor")) return Monitor
    if (lowerName.includes("mikrofon")) return Mic
    if (lowerName.includes("audio") || lowerName.includes("głośnik")) return Music
    if (lowerName.includes("internet") || lowerName.includes("wifi")) return Wifi
    if (lowerName.includes("telewizor") || lowerName.includes("tv")) return Tv
    if (lowerName.includes("klimatyzacja")) return Thermometer
    if (lowerName.includes("tablica")) return PenTool
    return CheckCircle2
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {equipment.map((item) => {
        const Icon = getEquipmentIcon(item.name)
        return (
          <div key={item.id} className="flex items-center p-3 rounded-lg border bg-card">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{item.name}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
