import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";

import { AppSidebar } from "./components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
