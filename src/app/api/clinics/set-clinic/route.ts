// app/api/set-clinic/route.ts
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { sessionsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  const { clinicId } = await req.json();

  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new NextResponse("Sessão não encontrada", { status: 401 });
  }

  if (!clinicId) {
    await db
      .update(sessionsTable)
      .set({ clinicData: null })
      .where(eq(sessionsTable.id, session.session.id));

    return new NextResponse(null, { status: 200 });
  }

  const result = await db.query.usersToClinicsTable.findFirst({
    where: and(
      eq(usersToClinicsTable.clinicId, clinicId),
      eq(usersToClinicsTable.userId, session.user.id),
    ),
    with: {
      clinic: true,
    },
  });

  if (!result) {
    return new NextResponse("Clínica não encontrada", { status: 404 });
  }

  const clinicData = JSON.stringify(result.clinic);

  await db
    .update(sessionsTable)
    .set({ clinicData })
    .where(eq(sessionsTable.id, session.session.id));

  return new NextResponse(null, { status: 204 });
};
