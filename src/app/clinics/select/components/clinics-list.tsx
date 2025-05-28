import { Button } from "@/components/ui/button";

export default function ClinicsList({
  clinics,
}: {
  clinics: {
    clinicId: string;
    clinic: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date | null;
    };
  }[];
}) {
  return (
    <div>
      {clinics.map((clinic) => (
        <Button key={clinic.clinicId}>{clinic.clinic.name}</Button>
      ))}
    </div>
  );
}
