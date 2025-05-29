import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import ClinicsList from "./components/clinics-list";
import CreateClinic from "./components/create-clinic";

export default async function ClinicsSelectPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result) {
    return redirect("/authentication");
  }

  const clinic = result.session.clinicData;

  if (clinic) {
    return redirect("/dashboard");
  }

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, result.user.id),
    with: {
      clinic: true,
    },
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Bem vindo, {result.user.name}</CardTitle>
          <CardDescription>Escolha uma clínica para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClinicsList clinics={clinics} />
        </CardContent>
        <CardFooter>
          <CreateClinic />
        </CardFooter>
      </Card>
    </div>
  );
}
