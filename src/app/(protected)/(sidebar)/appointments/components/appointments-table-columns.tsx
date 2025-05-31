"use client";

import { ColumnDef } from "@tanstack/react-table";

import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import AppointmentsTableActions from "./appointments-table-actions";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

interface AppointmentsTableColumnsProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export const createAppointmentsTableColumns = ({
  patients,
  doctors,
}: AppointmentsTableColumnsProps): ColumnDef<AppointmentWithRelations>[] => [
  {
    id: "date",
    accessorKey: "date",
    header: "Data",
    cell: (params) => {
      const date = new Date(params.row.original.date);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <AppointmentsTableActions
          appointment={appointment}
          patients={patients}
          doctors={doctors}
        />
      );
    },
  },
];
