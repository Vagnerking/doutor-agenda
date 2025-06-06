import { FaUserFriends,FaUserMd } from "react-icons/fa";
import { MdAttachMoney,MdEventAvailable } from "react-icons/md";

import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  totalRevenue: number;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const stats = [
  {
    label: "Faturamento",
    icon: <MdAttachMoney className="text-blue-500 w-5 h-5" />, // dinheiro
    getValue: (value: number) =>
      value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }),
    key: "totalRevenue",
  },
  {
    label: "Agendamentos",
    icon: <MdEventAvailable className="text-blue-500 w-5 h-5" />, // calendário
    getValue: (value: number) => value,
    key: "totalAppointments",
  },
  {
    label: "Pacientes",
    icon: <FaUserFriends className="text-blue-500 w-5 h-5" />, // pessoas
    getValue: (value: number) => value,
    key: "totalPatients",
  },
  {
    label: "Médicos",
    icon: <FaUserMd className="text-blue-500 w-5 h-5" />, // médico
    getValue: (value: number) => value,
    key: "totalDoctors",
  },
];

export function StatsCard({ totalRevenue, totalAppointments, totalPatients, totalDoctors }: StatsCardProps) {
  const values: Record<string, number> = {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.key}
          className="h-full bg-white rounded-xl shadow-none border border-[#F3F4F6] px-6 py-5 flex flex-col justify-center"
        >
          <CardContent className="flex flex-col gap-3 p-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-50 rounded-full p-2 flex items-center justify-center">
                {stat.icon}
              </span>
              <span className="text-muted-foreground font-medium text-sm leading-none">
                {stat.label}
              </span>
            </div>
            <span className="text-3xl font-medium text-black leading-tight">
              {stat.getValue(values[stat.key])}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StatsCard;