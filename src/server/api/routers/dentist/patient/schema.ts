import { z } from "zod";

export const getMyPatientsSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
});

export const getPatientByIdSchema = z.object({
	id: z.string(),
});

export const updatePatientNotesSchema = z.object({
	id: z.string(),
	notes: z.string(),
});


export const markAsCompletedSchema = z.object({
	id: z.string(),
});

export const sendToTechnicianSchema = z.object({
	id: z.string(),
});
