import { z } from "zod";

const prosthesisStageSchema = z.object({
	name: z.string().min(1, { message: "Protez aşaması adı zorunludur" }),
	description: z.string().optional(),
	percentage: z
		.number()
		.min(0, { message: "Yüzde değeri 0'dan küçük olamaz" })
		.max(100, { message: "Yüzde değeri 100'den büyük olamaz" }),
	price: z.number().int().min(0, { message: "Fiyat 0'dan küçük olamaz" }),
});

export const createSchema = prosthesisStageSchema;

export const updateSchema = prosthesisStageSchema.extend({
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
