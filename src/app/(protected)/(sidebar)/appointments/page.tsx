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
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, clinic.id),
      with: {
        patient: true,
        doctor: true,
      },
    }),
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
        <AppointmentsTable
          appointments={appointments}
          patients={patients}
          doctors={doctors}
        />
      </PageContent>
    </PageContainer>
  );
}
