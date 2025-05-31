"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
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

    await db
      .insert(patientsTable)
      .values({
        id: parsedInput.id,
        clinicId: clinic?.id ?? "",
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
        },
      });

    revalidatePath("/patients");
  });
