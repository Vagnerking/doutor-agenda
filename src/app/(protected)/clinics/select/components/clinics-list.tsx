"use client";

import { Label } from "@radix-ui/react-label";
import { ChevronRightIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const handleClinicClick = (clinicId: string) => {
  sessionStorage.setItem("clinicId", clinicId);
  redirect("/dashboard");
};

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
  sessionStorage.setItem("clinicId", "");

  return (
    <div>
      <Card
        className={`flex max-h-[210px] min-h-[210px] flex-col gap-2 overflow-y-auto p-4 ${clinics.length === 0 ? "justify-center" : ""}`}
      >
        {clinics.length > 0 ? (
          clinics.map((clinic) => (
            <Card
              key={clinic.clinicId}
              className="flex max-h-[80px] min-h-[80px] flex-row items-center justify-between p-4 hover:cursor-pointer hover:bg-slate-50"
              onClick={() => handleClinicClick(clinic.clinicId)}
            >
              <CardTitle>{clinic.clinic.name}</CardTitle>
              <CardDescription>
                Adicionada em {clinic.clinic.createdAt.toLocaleDateString()}
              </CardDescription>
              <ChevronRightIcon className="text-blue-500 group-hover:text-white" />
            </Card>
          ))
        ) : (
          <Label className="text-center text-gray-400">
            Ainda não há clínicas
          </Label>
        )}
      </Card>
    </div>
  );
}
