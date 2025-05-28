"use server";

import { headers } from "next/headers";

import { clinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getClinicFromSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }
  const clinic = session?.session.clinicData
    ? (JSON.parse(
        session.session.clinicData,
      ) as typeof clinicsTable.$inferSelect)
    : null;

  return clinic;
};
