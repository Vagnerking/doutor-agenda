import { addMinutes, format, isBefore, parse } from "date-fns";

import { appointmentsTable, doctorsTable } from "@/db/schema";

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30,
): string[] {
  const slots: string[] = [];

  if (!startTime || !endTime) {
    return slots;
  }

  const baseDate = new Date(2000, 0, 1); // 1 de janeiro de 2000

  try {
    // Sempre usa o formato HH:mm já que normalizamos antes
    const start = parse(startTime, "HH:mm", baseDate);
    const end = parse(endTime, "HH:mm", baseDate);

    let current = start;

    while (isBefore(current, end)) {
      slots.push(format(current, "HH:mm"));
      current = addMinutes(current, intervalMinutes);
    }
  } catch (error) {
    console.error("Erro ao gerar slots de horário:", error, {
      startTime,
      endTime,
    });
  }

  return slots;
}

export function getAvailableTimeSlots(
  startTime: string,
  endTime: string,
  existingAppointments: (typeof appointmentsTable.$inferSelect)[],
  selectedDate: Date,
  doctorId: string,
  currentAppointmentId?: string,
  intervalMinutes: number = 30,
): string[] {
  const allSlots = generateTimeSlots(startTime, endTime, intervalMinutes);

  // Normaliza a data selecionada para comparação (apenas ano, mês e dia)
  const selectedDateStr = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD

  // Filtra agendamentos confirmados para o mesmo médico e data
  const occupiedTimes = existingAppointments
    .filter((appointment) => {
      // Ignora o agendamento atual (para edição)
      if (currentAppointmentId && appointment.id === currentAppointmentId) {
        return false;
      }

      // Só considera agendamentos confirmados
      if (appointment.status !== "confirmed") {
        return false;
      }

      // Mesmo médico
      if (appointment.doctorId !== doctorId) {
        return false;
      }

      // Mesma data - normaliza a data do agendamento para comparação
      const appointmentDate = new Date(appointment.date);
      const appointmentDateStr = appointmentDate.toISOString().split("T")[0]; // YYYY-MM-DD

      return selectedDateStr === appointmentDateStr;
    })
    .map((appointment) => {
      // Normaliza o horário para HH:mm
      const timeParts = appointment.time.split(":");
      return `${timeParts[0]}:${timeParts[1]}`;
    });

  // Retorna apenas os horários não ocupados
  return allSlots.filter((slot) => !occupiedTimes.includes(slot));
}

export function isDoctorAvailableOnDate(
  date: Date,
  doctor: typeof doctorsTable.$inferSelect,
): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Convert to match doctor's week day format (1 = Monday, 7 = Sunday)
  const doctorDayFormat = dayOfWeek === 0 ? 7 : dayOfWeek;

  return (
    doctorDayFormat >= doctor.availableFromWeekDay &&
    doctorDayFormat <= doctor.availableToWeekDay
  );
}

export function isDateValid(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate >= today;
}

export function formatPriceFromCents(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2);
}

export function parsePriceToCents(priceString: string): number {
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanPrice = priceString.replace(/[^\d,\.]/g, "");

  // Substitui vírgula por ponto para conversão
  const normalizedPrice = cleanPrice.replace(",", ".");

  // Converte para número e multiplica por 100 para obter centavos
  const priceInReais = parseFloat(normalizedPrice) || 0;

  return Math.round(priceInReais * 100);
}
