import { Clinic } from "@/types/clinic";

export function convertClinicDatFromServerSession(clinicData: string) {
  try {
    const clinic = JSON.parse(clinicData) as Clinic;
    return clinic;
  } catch {
    return null;
  }
}
