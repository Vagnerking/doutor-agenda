"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { convertClinicDatFromServerSession } from "@/utils/clinic/clinic-helper";

import { upsertDoctorSchema } from "./schema";

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
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
      .insert(doctorsTable)
      .values({
        id: parsedInput.id,
        clinicId: clinic?.id ?? "",
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
        },
      });
  });
