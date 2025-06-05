"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { createAppointment } from "@/actions/appointments/create";
import { updateAppointment } from "@/app/actions/appointments/update";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import {
  formatPriceFromCents,
  generateTimeSlots,
  isDateValid,
  isDoctorAvailableOnDate,
  parsePriceToCents,
} from "@/lib/appointment-utils";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
  patientId: z.string().min(1, { message: "Paciente é obrigatório" }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }),
  appointmentPrice: z
    .string()
    .min(1, { message: "Valor da consulta é obrigatório" }),
});

type FormValues = z.infer<typeof formSchema>;

interface UpsertAppointmentFormProps {
  appointment?: typeof appointmentsTable.$inferSelect | undefined;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  closeDialog: () => void;
  key?: string; // Para forçar re-render quando necessário
}

export function UpsertAppointmentForm({
  appointment,
  patients,
  doctors,
  closeDialog,
}: UpsertAppointmentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      time: "",
      patientId: "",
      doctorId: "",
      appointmentPrice: "",
    },
  });

  // Normaliza o horário para o formato HH:mm se necessário
  const normalizeTime = useCallback((timeStr: string | null) => {
    if (!timeStr) return "";

    // Se o horário tem formato HH:mm:ss, extrai apenas HH:mm
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }, []);

  // Reset form quando o componente é montado ou quando appointment muda
  useEffect(() => {
    if (appointment) {
      const normalizedTime = normalizeTime(appointment.time);

      // Modo edição - preenche com dados do appointment
      const formData = {
        date: appointment.date ? new Date(appointment.date) : undefined,
        time: normalizedTime,
        patientId: appointment.patientId ?? "",
        doctorId: appointment.doctorId ?? "",
        appointmentPrice: appointment.appointmentPriceInCents
          ? formatPriceFromCents(appointment.appointmentPriceInCents)
          : "",
      };

      form.reset(formData);
    } else {
      // Modo criação - reseta para valores vazios
      form.reset({
        date: undefined,
        time: "",
        patientId: "",
        doctorId: "",
        appointmentPrice: "",
      });
    }
  }, [appointment, form, normalizeTime]);

  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("date");

  const selectedDoctor = useMemo(() => {
    return doctors.find((doctor) => doctor.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  const availableTimeSlots = useMemo(() => {
    if (
      !selectedDoctor ||
      !selectedDoctor.availableFromTime ||
      !selectedDoctor.availableToTime
    ) {
      return [];
    }

    // Normaliza os horários para o formato local
    const normalizeTimeSlotsFormat = (timeStr: string) => {
      if (!timeStr) return "";

      // Se o horário tem formato HH:mm:ss, extrai apenas HH:mm
      const parts = timeStr.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return timeStr;
    };

    const fromTime = normalizeTimeSlotsFormat(selectedDoctor.availableFromTime);
    const toTime = normalizeTimeSlotsFormat(selectedDoctor.availableToTime);

    return generateTimeSlots(fromTime, toTime, 30);
  }, [selectedDoctor]);

  // Atualiza o horário quando os slots ficam disponíveis (apenas no modo edição)
  useEffect(() => {
    if (appointment && availableTimeSlots.length > 0) {
      const normalizedTime = normalizeTime(appointment.time);
      const currentTime = form.getValues("time");

      // Se o horário não está definido ou é diferente do esperado, define novamente
      if (!currentTime || currentTime !== normalizedTime) {
        // Verifica se o horário está na lista de slots disponíveis
        if (availableTimeSlots.includes(normalizedTime)) {
          form.setValue("time", normalizedTime);
        }
      }
    }
  }, [appointment, availableTimeSlots, form, normalizeTime]);

  const filteredPatients = useMemo(() => {
    // Só mostra pacientes se um médico foi selecionado
    return selectedDoctorId ? patients : [];
  }, [patients, selectedDoctorId]);

  const createAppointmentAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      closeDialog();
    },
    onError: (error) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error(
        "Erro ao criar agendamento. Verifique os dados e tente novamente.",
      );
    },
  });

  const updateAppointmentAction = useAction(updateAppointment, {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso");
      closeDialog();
    },
    onError: (error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error(
        "Erro ao atualizar agendamento. Verifique os dados e tente novamente.",
      );
    },
  });

  // Preenche automaticamente o preço quando seleciona um médico (apenas no modo criação)
  useEffect(() => {
    if (selectedDoctor && !appointment) {
      form.setValue(
        "appointmentPrice",
        formatPriceFromCents(selectedDoctor.appointmentPriceInCents),
      );
    }
  }, [selectedDoctor, form, appointment]);

  // Reseta campos dependentes quando muda o médico (apenas no modo criação)
  useEffect(() => {
    if (selectedDoctorId && !appointment) {
      form.setValue("patientId", "");
      form.setValue("time", "");
    }
  }, [selectedDoctorId, form, appointment]);

  // Valida data quando muda
  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      if (!isDateValid(selectedDate)) {
        form.setError("date", {
          type: "manual",
          message: "A data deve ser maior que a atual",
        });
      } else if (!isDoctorAvailableOnDate(selectedDate, selectedDoctor)) {
        form.setError("date", {
          type: "manual",
          message: "O médico não atende neste dia da semana",
        });
      } else {
        form.clearErrors("date");
      }
    }
  }, [selectedDate, selectedDoctor, form]);

  const onSubmit = (values: FormValues) => {
    try {
      // Validações adicionais
      if (
        !values.patientId ||
        !values.doctorId ||
        !values.date ||
        !values.time
      ) {
        toast.error("Todos os campos são obrigatórios");
        return;
      }

      const priceInCents = parsePriceToCents(values.appointmentPrice);

      if (priceInCents <= 0) {
        toast.error("O valor da consulta deve ser maior que zero");
        return;
      }

      const appointmentData = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        date: values.date,
        time: values.time,
        appointmentPriceInCents: priceInCents,
      };

      console.log("Dados do agendamento:", appointmentData);

      if (appointment) {
        updateAppointmentAction.execute({
          id: appointment.id,
          ...appointmentData,
        });
      } else {
        createAppointmentAction.execute(appointmentData);
      }
    } catch (error) {
      console.error("Erro no onSubmit:", error);
      toast.error("Erro ao processar dados do agendamento");
    }
  };

  const isLoading =
    createAppointmentAction.status === "executing" ||
    updateAppointmentAction.status === "executing";

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {appointment ? "Editar Agendamento" : "Novo Agendamento"}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? "Atualize as informações do agendamento"
            : "Preencha os dados para criar um novo agendamento"}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedDoctorId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedDoctorId
                            ? "Selecione um paciente"
                            : "Selecione um médico primeiro"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={!selectedDoctorId || !selectedDate}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !selectedDoctorId
                            ? "Selecione um médico primeiro"
                            : !selectedDate
                              ? "Selecione uma data primeiro"
                              : "Selecione um horário"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-muted-foreground px-2 py-1.5 text-sm">
                        Nenhum horário disponível
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta (R$)</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !selectedDoctorId || !selectedDate}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
