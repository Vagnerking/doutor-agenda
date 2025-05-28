"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createClinic } from "@/app/actions/clinics/create-clinic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const createClinicSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da clínica é obrigatório" }),
});

export default function CreateClinic() {
  const [open, setOpen] = useState(false);
  const createClinicForm = useForm<z.infer<typeof createClinicSchema>>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onCreateClinicSubmit(
    values: z.infer<typeof createClinicSchema>,
  ) {
    try {
      await createClinic(values.name);
      toast.success("Clínica criada com sucesso");
      createClinicForm.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar clínica");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar clínica
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Criar nova clínica</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...createClinicForm}>
          <form
            onSubmit={createClinicForm.handleSubmit(onCreateClinicSubmit)}
            className="space-y-6"
          >
            <FormField
              control={createClinicForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={createClinicForm.formState.isSubmitting}
              >
                {createClinicForm.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {createClinicForm.formState.isSubmitting
                  ? "Cadastrando..."
                  : "Cadastrar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
