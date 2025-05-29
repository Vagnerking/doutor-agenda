import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LogoutButton from "./components/logout-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>{session.user.email}</h2>
      <h2>{session.user.name}</h2>
      <h2></h2>
      <LogoutButton />
    </div>
  );
}
