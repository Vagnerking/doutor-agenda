import dayjs from "dayjs";
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
import { getDashboard } from "@/data/getDashboard";
import { auth } from "@/lib/auth";
import { Clinic } from "@/types/clinic";

import { DatePicker } from "./components/date-picker";
import { RevenueChart } from "./components/revenue-chart";
import StatsCard from "./components/stats-card";
import TopDoctors from "./components/top-doctors";

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

  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: clinicData.id,
        },
      },
    },
  });

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
          totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <RevenueChart dailyAppointmentsData={dailyAppointmentsData} />
          <TopDoctors doctors={topDoctors}/>
        </div>
      </PageContent>
    </PageContainer>
  );
}
