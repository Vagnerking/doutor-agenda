"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
import { doctorsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";

import { AddDoctorButton } from "./components/add-doctor-button";
import DoctorsList from "./components/doctors-list";

export default async function DoctorsPage() {
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

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, clinicData.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>Gerencie os médicos da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DoctorsList doctors={doctors} />
      </PageContent>
    </PageContainer>
  );
}
