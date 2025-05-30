"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDoctor } from "@/app/actions/doctors/delete";
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
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import { getAvailability } from "../helpers/availability";
import { UpsertDoctorForm } from "./upsert-doctor-form";

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(doctor);

  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Médico deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar médico");
    },
  });

  const handleDeleteDoctor = () => {
    if (!doctor) return;
    deleteDoctorAction.execute({ id: doctor.id });
  };

  return (
    <Card className="max-w-[350px] px-6">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <div className="flex items-center">
          <Avatar className="mr-3 h-10 w-10">
            <AvatarFallback className="text-primary bg-slate-100">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">{doctor.name}</CardTitle>
            <p className="text-muted-foreground text-xs">{doctor.specialty}</p>
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
                Tem certeza que deseja excluir o médico
                <b>
                  {" '"}
                  {doctor.name}
                  {"' "}
                </b>
                ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação é <b>irreversível</b> e <b>não poderá ser desfeita</b>
                . Isso também irá deletar <b>todos os agendamentos</b>{" "}
                associados a este médico.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                asChild
              >
                <Button onClick={handleDeleteDoctor} className="font-bold">
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
          <CalendarIcon className="mr-1" />
          {availability.from
            .format("dddd")
            .replace(/^\w/, (c) => c.toUpperCase())}{" "}
          a{" "}
          {availability.to
            .format("dddd")
            .replace(/^\w/, (c) => c.toUpperCase())}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-lg border-0 bg-slate-100 px-2 py-1"
        >
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} às{" "}
          {availability.to.format("HH:mm")}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-lg border-0 bg-slate-100 px-2 py-1"
        >
          <DollarSignIcon className="mr-1" />
          {formatCurrencyInCents(doctor.appointmentPriceInCents)}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-0">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertDoctorForm
            doctor={{
              ...doctor,
              availableFromTime: availability.from.format("HH:mm:ss"),
              availableToTime: availability.to.format("HH:mm:ss"),
            }}
            closeDialog={() => setIsOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
}
