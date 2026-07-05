import { z } from "zod";

export const getPatientNotesSchema = z.object({
	patientId: z.string().min(1, "Hasta ID gereklidir"),
});