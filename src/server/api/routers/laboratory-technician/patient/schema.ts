import { z } from "zod";

export const getAllPatientsSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
});

export const getPatientByIdSchema = z.object({
	id: z.string(),
});

export const getDentalWorksByPatientIdSchema = z.object({
	patientId: z.string(),
});
