import { addMinutes, format, isBefore, parse } from "date-fns";

import { doctorsTable } from "@/db/schema";

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
  if (!priceString || priceString.trim() === "") {
    return 0;
  }

  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanPrice = priceString.replace(/[^\d,.-]/g, "");

  // Substitui vírgula por ponto para parseFloat
  const normalizedPrice = cleanPrice.replace(",", ".");

  const parsed = parseFloat(normalizedPrice);

  if (isNaN(parsed)) {
    return 0;
  }

  return Math.round(parsed * 100);
}
