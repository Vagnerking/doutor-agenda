"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
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
      .insert(appointmentsTable)
      .values({
        id: parsedInput.id,
        clinicId: clinic.id,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: parsedInput.date,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          date: parsedInput.date,
          appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        },
      });

    revalidatePath("/appointments");
  });
