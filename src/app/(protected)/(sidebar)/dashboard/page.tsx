import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";
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
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Clinic } from "@/types/clinic";

import { DatePicker } from "./components/date-picker";
import { RevenueChart } from "./components/revenue-chart";
import { StatsCard } from "./components/stats-card";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>
}


export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { from, to } = await searchParams;

  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/authentication");
  }

  const clinicData = JSON.parse(session.session.clinicData) as Clinic | null;

  if (!clinicData) {
    redirect("/clinics/select");
  }
  
  const [
    [{ totalRevenue }],
    [{ totalAppointments }],
    [{ totalPatients }],
    [{ totalDoctors }]
  ] = await Promise.all([
    db.select({ totalRevenue: sum(appointmentsTable.appointmentPriceInCents) }).from(appointmentsTable).where(
      and(
        eq(appointmentsTable.clinicId, clinicData.id),
        gte(appointmentsTable.date, dayjs(from, "YYYY-MM-DD").startOf("day").toDate()),
        lte(appointmentsTable.date, dayjs(to, "YYYY-MM-DD").endOf("day").toDate()),
        eq(appointmentsTable.status, "confirmed")
      )
    ),
    db.select({ totalAppointments: count() }).from(appointmentsTable).where(
      and(
        eq(appointmentsTable.clinicId, clinicData.id),
        gte(appointmentsTable.date, dayjs(from, "YYYY-MM-DD").startOf("day").toDate()),
        lte(appointmentsTable.date, dayjs(to, "YYYY-MM-DD").endOf("day").toDate()),
      )
    ),
    db.select({ totalPatients: count() }).from(patientsTable).where(
      eq(patientsTable.clinicId, clinicData.id)
    ),
    db.select({ totalDoctors: count() }).from(doctorsTable).where(
      eq(doctorsTable.clinicId, clinicData.id)
    ),
  ]);

  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

  const dailyAppointmentsData = await db.select({
    date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
    appointments: count(appointmentsTable.id),
    revenue: sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as("revenue")
  }).from(appointmentsTable)
  .where(
    and(
      eq(appointmentsTable.clinicId, clinicData.id),
      gte(appointmentsTable.date, chartStartDate),
      lte(appointmentsTable.date, chartEndDate),
    )
  )
  .groupBy(sql`DATE(${appointmentsTable.date})`)
  .orderBy(sql`DATE(${appointmentsTable.date})`);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCard
          totalRevenue={(Number(totalRevenue) / 100)}
          totalAppointments={totalAppointments}
          totalPatients={totalPatients}
          totalDoctors={totalDoctors}
        />
        <div className="grid grid-cols-[2.25fr_1fr]">
          <RevenueChart dailyAppointmentsData={dailyAppointmentsData} />
        </div>
      </PageContent>
    </PageContainer>
  );
}
