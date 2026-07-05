import { z } from "zod";

const additionalTreatmentSchema = z.object({
	name: z.string().min(1, { message: "Ek tedavi adı zorunludur" }),
	description: z.string().optional(),
	defaultPrice: z.number().optional(),
});

export const createSchema = additionalTreatmentSchema;

export const updateSchema = additionalTreatmentSchema.extend({
	id: z.string(),
});

export const deleteSchema = z.object({
	id: z.string(),
});

export const getAllSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
	sort: z
		.array(
			z.object({
				id: z.string(),
				desc: z.boolean(),
			}),
		)
		.optional(),
});