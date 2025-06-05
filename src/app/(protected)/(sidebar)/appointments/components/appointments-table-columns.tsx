"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import AppointmentsTableActions from "./appointments-table-actions";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

interface AppointmentsTableColumnsProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  allAppointments: (typeof appointmentsTable.$inferSelect)[];
}

export const createAppointmentsTableColumns = ({
  patients,
  doctors,
  allAppointments,
}: AppointmentsTableColumnsProps): ColumnDef<AppointmentWithRelations>[] => [
  {
    id: "dateTime",
    accessorKey: "date",
    header: "Data",
    cell: (params) => {
      const appointment = params.row.original;
      const date = new Date(appointment.date);

      // Se há horário, adiciona à data
      if (appointment.time) {
        const [hours, minutes] = appointment.time.split(":");
        date.setHours(parseInt(hours), parseInt(minutes));
      }

      return format(date, "PPP 'às' HH:mm", { locale: ptBR });
    },
  },
  {
    id: "patient",
    accessorKey: "patient",
    header: "Paciente",
    cell: (params) => {
      return params.row.original.patient?.name;
    },
  },
  {
    id: "doctor",
    accessorKey: "doctor",
    header: "Médico",
    cell: (params) => {
      return params.row.original.doctor?.name;
    },
  },
  {
    id: "specialty",
    accessorKey: "doctor.specialty",
    header: "Especialidade",
    cell: (params) => {
      return params.row.original.doctor?.specialty;
    },
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: (params) => {
      const price = params.row.original.appointmentPriceInCents;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price / 100);
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const status = params.row.original.status;
      const statusMap = {
        confirmed: "Confirmado",
        cancelled: "Cancelado",
      };

      const statusText = statusMap[status as keyof typeof statusMap] || status;
      const statusColor =
        status === "cancelled" ? "text-red-600" : "text-green-600";

      return <span className={statusColor}>{statusText}</span>;
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <AppointmentsTableActions
          appointment={appointment}
          patients={patients}
          doctors={doctors}
          allAppointments={allAppointments}
        />
      );
    },
  },
];
