import { z } from "zod";

const toothColorSchema = z.object({
	name: z.string().min(1, { message: "Renk adı zorunludur" }),
	description: z.string().optional(),
});

export const createSchema = toothColorSchema;

export const updateSchema = toothColorSchema.extend({
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
