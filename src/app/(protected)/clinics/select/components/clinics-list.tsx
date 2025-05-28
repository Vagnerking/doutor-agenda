"use client";

import { Label } from "@radix-ui/react-label";
import { ChevronRightIcon, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleClinicClick = async (clinicId: string) => {
    setIsLoading(true);

    await fetch("/api/clinics/set-clinic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicId }),
    }).then((res) => {
      if (res.status === 204) {
        redirect("/dashboard");
      } else if (res.status === 401) {
        toast.error("Sessão expirada");
        setIsLoading(false);
        redirect("/authentication");
      } else if (res.status === 404) {
        toast.error("Clínica não encontrada");
        setIsLoading(false);
      } else {
        toast.error("Erro ao selecionar clínica");
        setIsLoading(false);
      }
    });
  };

  return (
    <div>
      <Card
        className={`flex max-h-[210px] min-h-[210px] flex-col gap-2 overflow-y-auto p-4 ${clinics.length === 0 || isLoading ? "justify-center" : ""}`}
      >
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : clinics.length > 0 ? (
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
