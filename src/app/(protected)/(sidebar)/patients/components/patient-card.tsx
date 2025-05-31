"use client";

import { MailIcon, PhoneIcon, TrashIcon, UserIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePatient } from "@/app/actions/patients/delete";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { patientsTable } from "@/db/schema";
import { getInitials } from "@/helpers/initials";

import { UpsertPatientForm } from "./upsert-patient-form";

interface PatientCardProps {
  patient: typeof patientsTable.$inferSelect;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const patientInitials = getInitials(patient.name);

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success("Paciente excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir paciente");
    },
  });

  const handleDeletePatient = () => {
    if (!patient) return;
    deletePatientAction.execute({ id: patient.id });
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");
    // Aplica a máscara (11) 99999-9999
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <Card className="max-w-[350px] px-6">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <div className="flex items-center">
          <Avatar className="mr-3 h-10 w-10">
            <AvatarFallback className="text-primary bg-slate-100">
              {patientInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">
              {patient.name}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {patient.sex === "male" ? "Masculino" : "Feminino"}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <TrashIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-medium">
                Tem certeza que deseja excluir o paciente
                <b>
                  {" '"}
                  {patient.name}
                  {"' "}
                </b>
                ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação é <b>irreversível</b> e <b>não poderá ser desfeita</b>
                . Isso também irá deletar <b>todos os agendamentos</b>{" "}
                associados a este paciente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                asChild
              >
                <Button onClick={handleDeletePatient} className="font-bold">
                  Excluir
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 p-0">
        <Badge
          variant="outline"
          className="rounded-lg border-0 bg-slate-100 px-2 py-1"
        >
          <MailIcon className="mr-1" />
          {patient.email}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-lg border-0 bg-slate-100 px-2 py-1"
        >
          <PhoneIcon className="mr-1" />
          {formatPhoneNumber(patient.phoneNumber)}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-lg border-0 bg-slate-100 px-2 py-1"
        >
          <UserIcon className="mr-1" />
          {patient.sex === "male" ? "Masculino" : "Feminino"}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-0">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            closeDialog={() => setIsOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
}
