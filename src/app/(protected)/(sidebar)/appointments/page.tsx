import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";

import { AddAppointmentButton } from "./components/add-appointment-button";
import { AppointmentsTable } from "./components/appointments-table";

export default async function AppointmentsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result) {
    throw new Error("Unauthorized");
  }

  const clinic = convertClinicDatFromServerSession(
    result.session.clinicData ?? "",
  );

  if (!clinic) {
    throw new Error("Clinic not found");
  }

  // Buscar pacientes, médicos e agendamentos da clínica em paralelo
  const [patients, doctors, appointments] = await Promise.all([
    db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinic.id)),
    db.select().from(doctorsTable).where(eq(doctorsTable.clinicId, clinic.id)),
    // Buscar agendamentos usando select direto para evitar problemas com relações
    db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinic.id)),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton patients={patients} doctors={doctors} />
        </PageActions>
      </PageHeader>
      <PageContent>
        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhum agendamento encontrado. Crie seu primeiro agendamento!
            </p>
          </div>
        ) : (
          <AppointmentsTable
            appointments={appointments.map((appointment) => ({
              ...appointment,
              patient: patients.find((p) => p.id === appointment.patientId) || {
                id: appointment.patientId,
                name: "Paciente não encontrado",
                email: "",
                phoneNumber: "",
                sex: "male" as const,
                clinicId: clinic.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              doctor: doctors.find((d) => d.id === appointment.doctorId) || {
                id: appointment.doctorId,
                name: "Médico não encontrado",
                specialty: "",
                appointmentPriceInCents: 0,
                availableFromWeekDay: 1,
                availableToWeekDay: 5,
                availableFromTime: "08:00:00",
                availableToTime: "17:00:00",
                clinicId: clinic.id,
                avatarImageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }))}
            patients={patients}
            doctors={doctors}
          />
        )}
      </PageContent>
    </PageContainer>
  );
}
