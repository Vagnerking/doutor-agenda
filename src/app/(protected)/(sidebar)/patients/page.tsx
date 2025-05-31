"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
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
import { patientsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";

import { AddPatientButton } from "./components/add-patient-button";
import { patientsTableColumns } from "./components/patients-table-columns";
export default async function PatientsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result) {
    redirect("/authentication");
  }

  const clinicData = convertClinicDatFromServerSession(
    result.session.clinicData ?? "",
  );

  if (!clinicData) {
    redirect("/clinics/select");
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, clinicData.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable columns={patientsTableColumns} data={patients} />
      </PageContent>
    </PageContainer>
  );
}
