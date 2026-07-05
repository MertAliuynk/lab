import { z } from "zod";

const prosthesisTypeSchema = z.object({
	name: z.string().min(1, { message: "Protez tipi adı zorunludur" }),
	description: z.string().optional(),
	defaultPrice: z.number().optional(),
	pricingType: z.enum(["TOOTH_BASED", "JAW_BASED"]).optional().default("TOOTH_BASED"),
});

export const createSchema = prosthesisTypeSchema;

export const updateSchema = prosthesisTypeSchema.extend({
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
