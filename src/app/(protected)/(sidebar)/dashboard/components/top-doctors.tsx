import { Stethoscope } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Doctor {
  id: string
  name: string
  avatarImageUrl: string | null
  specialty: string
  appointments: number
}

interface TopDoctorsProps {
  doctors: Doctor[]
}

export default function TopDoctors({ doctors }: TopDoctorsProps) {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="text-muted-foreground" />
          <CardTitle className="text-base">Médicos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-muted">
                {doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium">{doctor.appointments} agend.</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
