"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

const deleteAppointmentSchema = z.object({
  id: z.string(),
});

export async function deleteAppointment(
  data: z.infer<typeof deleteAppointmentSchema>,
) {
  try {
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, data.id));
    revalidatePath("/appointments");
    return { data: { success: true } };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { serverError: "Failed to delete appointment" };
  }
}
