"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { convertClinicDatFromServerSession } from "@/helpers/clinic/clinic-helper";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createAppointmentSchema } from "./schema";

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
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

      console.log("Criando agendamento:", {
        clinicId: clinic.id,
        ...parsedInput,
      });

      await db.insert(appointmentsTable).values({
        clinicId: clinic.id,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: parsedInput.date,
        time: parsedInput.time,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      });

      revalidatePath("/appointments");
      revalidatePath("/dashboard");

      return { success: true };
    } catch (error) {
      console.error("Erro na action createAppointment:", error);
      throw error;
    }
  });
