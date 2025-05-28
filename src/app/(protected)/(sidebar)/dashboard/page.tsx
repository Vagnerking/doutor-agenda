import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getClinicFromSession } from "@/app/actions/clinics/get-from-session";
import { auth } from "@/lib/auth";

import LogoutButton from "./components/logout-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  const clinic = await getClinicFromSession();

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>{session.user.email}</h2>
      <h2>{session.user.name}</h2>
      <h2>{clinic?.name}</h2>
      <LogoutButton />
    </div>
  );
}
