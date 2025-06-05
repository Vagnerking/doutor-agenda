import { EditIcon, MoreVerticalIcon, TrashIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/appointments/cancel";
import { deleteAppointment } from "@/app/actions/appointments/delete";
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
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface AppointmentsTableActionsProps {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  allAppointments: (typeof appointmentsTable.$inferSelect)[];
}

export default function AppointmentsTableActions({
  appointment,
  patients,
  doctors,
  allAppointments,
}: AppointmentsTableActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir agendamento");
    },
  });

  const cancelAppointmentAction = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento");
    },
  });

  const handleDeleteAppointment = () => {
    if (!appointment) return;
    deleteAppointmentAction.execute({ id: appointment.id });
  };

  const handleCancelAppointment = () => {
    if (!appointment) return;
    cancelAppointmentAction.execute({ id: appointment.id });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (newOpen) {
      // Gera uma nova key para forçar reset do formulário
      setFormKey((prev) => prev + 1);
    }
  };

  const isCancelled = appointment.status === "cancelled";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Agendamento</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Só permite editar se não estiver cancelado */}
          {!isCancelled && (
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              <EditIcon />
              Editar
            </DropdownMenuItem>
          )}

          {/* Só permite cancelar se não estiver cancelado */}
          {!isCancelled && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <XIcon />
                  Cancelar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-medium">
                    Tem certeza que deseja cancelar este agendamento?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    O agendamento será marcado como cancelado e não poderá mais
                    ser editado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-orange-600 text-white hover:bg-orange-700"
                    asChild
                  >
                    <Button
                      onClick={handleCancelAppointment}
                      className="font-bold"
                    >
                      Cancelar Agendamento
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Sempre permite excluir */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon />
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-medium">
                  Tem certeza que deseja excluir este agendamento?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação é <b>irreversível</b> e{" "}
                  <b>não poderá ser desfeita</b>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-white"
                  asChild
                >
                  <Button
                    onClick={handleDeleteAppointment}
                    className="font-bold"
                  >
                    Excluir
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Só renderiza o formulário se não estiver cancelado */}
      {!isCancelled && (
        <UpsertAppointmentForm
          key={formKey.toString()}
          appointment={appointment}
          patients={patients}
          doctors={doctors}
          allAppointments={allAppointments}
          closeDialog={() => setIsOpen(false)}
        />
      )}
    </Dialog>
  );
}
