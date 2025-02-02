export const appointmentTypes = {
  Vaccination: "💉",
  Grooming: "✂️",
  Dental: "🦷",
  Medication: "💊",
  Other: "📅",
} as const;

export type AppointmentType = keyof typeof appointmentTypes;
