"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

const cancelAppointmentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const cancelAppointment = actionClient
  .schema(cancelAppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      await db
        .update(appointmentsTable)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(appointmentsTable.id, parsedInput.id));

      revalidatePath("/appointments");
      return { success: true };
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      throw new Error("Falha ao cancelar agendamento");
    }
  });
