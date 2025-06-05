"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { createAppointmentsTableColumns } from "./appointments-table-columns";

interface AppointmentsTableProps {
  appointments: (typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  })[];
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function AppointmentsTable({
  appointments,
  patients,
  doctors,
}: AppointmentsTableProps) {
  // Extrai apenas os dados básicos dos agendamentos para verificação de horários
  const allAppointments = appointments.map((item) => ({
    id: item.id,
    date: item.date,
    time: item.time,
    status: item.status,
    appointmentPriceInCents: item.appointmentPriceInCents,
    patientId: item.patientId,
    doctorId: item.doctorId,
    clinicId: item.clinicId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  const columns = createAppointmentsTableColumns({
    patients,
    doctors,
    allAppointments,
  });

  return <DataTable columns={columns} data={appointments} />;
}
