"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

export const deleteDoctor = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const clinic = convertClinicDatFromServerSession(
      session.session.clinicData ?? "",
    );

    if (!clinic) {
      throw new Error("Clinic not found");
    }

    await db
      .delete(doctorsTable)
      .where(
        and(
          eq(doctorsTable.id, parsedInput.id),
          eq(doctorsTable.clinicId, clinic.id),
        ),
      );

    revalidatePath("/doctors");
  });
