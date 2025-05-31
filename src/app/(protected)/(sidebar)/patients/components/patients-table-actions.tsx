import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
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
import { patientsTable } from "@/db/schema";

import { UpsertPatientForm } from "./upsert-patient-form";

export default function PatientsTableActions({
  patient,
}: {
  patient: typeof patientsTable.$inferSelect;
}) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <EditIcon />
            Editar
          </DropdownMenuItem>
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
                  Tem certeza que deseja excluir o paciente
                  <b>
                    {" '"}
                    {patient.name}
                    {"' "}
                  </b>
                  ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação é <b>irreversível</b> e{" "}
                  <b>não poderá ser desfeita</b>. Isso também irá deletar{" "}
                  <b>todos os agendamentos</b> associados a este paciente.
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
        </DropdownMenuContent>
      </DropdownMenu>

      <UpsertPatientForm
        patient={patient}
        closeDialog={() => setIsOpen(false)}
      />
    </Dialog>
  );
}
