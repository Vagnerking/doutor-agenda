"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface UpsertAppointmentDialogProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  allAppointments: (typeof appointmentsTable.$inferSelect)[];
}

export function AddAppointmentButton({
  patients,
  doctors,
  allAppointments,
}: UpsertAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (newOpen) {
      // Gera uma nova key para forçar reset do formulário
      setFormKey((prev) => prev + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo Agendamento
        </Button>
      </DialogTrigger>

      <UpsertAppointmentForm
        key={formKey.toString()}
        patients={patients}
        doctors={doctors}
        allAppointments={allAppointments}
        closeDialog={() => setIsOpen(false)}
      />
    </Dialog>
  );
}
