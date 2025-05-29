"use client";

import { authClient } from "@/lib/auth-client";
import { Clinic } from "@/types/clinic";
import { Session } from "@/types/session";

export const getClinicFromClientSession = () => {
  const result = authClient.useSession();

  const clinic = (result.data?.session as Session)?.clinicData as string | null;

  if (!clinic) {
    return null;
  }

  try {
    return JSON.parse(clinic) as Clinic;
  } catch {
    return null;
  }
};
