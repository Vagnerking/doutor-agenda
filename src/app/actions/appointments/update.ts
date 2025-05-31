"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

const updateAppointmentSchema = z.object({
  id: z.string(),
  date: z.date(),
  patientId: z.string(),
  doctorId: z.string(),
  appointmentPriceInCents: z.number(),
});

export async function updateAppointment(
  data: z.infer<typeof updateAppointmentSchema>,
) {
  try {
    await db
      .update(appointmentsTable)
      .set({
        date: data.date,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentPriceInCents: data.appointmentPriceInCents,
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, data.id));

    revalidatePath("/appointments");
    return { data: { success: true } };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { serverError: "Failed to update appointment" };
  }
}
