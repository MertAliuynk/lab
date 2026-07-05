import { z } from "zod";

export const getPatientNotesSchema = z.object({
	patientId: z.string(),
});

export const createPatientNoteSchema = z.object({
	patientId: z.string(),
	content: z.string().min(1, "Not içeriği boş bırakılamaz"),
});

export const updatePatientNoteSchema = z.object({
	id: z.string(),
	content: z.string().min(1, "Not içeriği boş bırakılamaz"),
});

export const deletePatientNoteSchema = z.object({
	id: z.string(),
});
