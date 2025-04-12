export type Building = {
  id: number
  name: string
  address: string
  created_at: string
}

export type Room = {
  id: number
  building_id: number
  name: string
  capacity: number
  floor: number
  area: number
  height: number
  width: number
  position_x: number
  position_y: number
  description: string
  building: string
  created_at: string
  updated_at: string
}

export type RoomEquipment = {
  id: number
  room_id: number
  name: string
  created_at: string
}

export type Reservation = {
  id: number
  room_id: number
  user_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  attendees: number
  status: string
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  full_name: string
  role: "admin" | "lecturer"
  created_at: string
  updated_at: string
}

export type ReservationWithRoom = Reservation & {
  room: Room
}

export type RoomWithEquipment = Room & {
  equipment: RoomEquipment[]
  building_name?: string
}
