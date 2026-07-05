import { z } from "zod";

export const getAllSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
	dentistId: z.string().optional(),
	clinicId: z.string().optional(),
	sort: z
		.array(
			z.object({
				id: z.string(),
				desc: z.boolean(),
			}),
		)
		.optional(),
});

export const getByIdSchema = z.object({
	id: z.string(),
});

export const createSchema = z.object({
	name: z.string().min(1, "İsim gereklidir"),
	notes: z.string().optional(),
	dentistId: z.string().min(1, "Diş hekimi seçilmelidir"),
});

export const updateSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "İsim gereklidir"),
	notes: z.string().optional(),
	dentistId: z.string().min(1, "Diş hekimi seçilmelidir"),
});

export const deleteSchema = z.object({
	id: z.string(),
});
