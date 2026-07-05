import { z } from "zod";

const clinicSchema = z.object({
	name: z.string().min(1, { message: "Klinik adı zorunludur" }),
	address: z.string().optional(),
});

export const createSchema = clinicSchema;

export const updateSchema = clinicSchema.extend({
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

export const getClinicPricesSchema = z.object({
	clinicId: z.string(),
});

export const updateClinicPricesSchema = z.object({
	clinicId: z.string(),
	prices: z.array(
		z.object({
			prosthesisTypeId: z.string(),
			price: z.number().min(0, { message: "Fiyat 0'dan küçük olamaz" }),
		}),
	),
});
