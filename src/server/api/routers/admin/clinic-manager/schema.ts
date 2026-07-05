import { z } from "zod";
import { baseUserSchema } from "../../schema";

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

export const createSchema = baseUserSchema
	.omit({ role: true })
	.extend({
		confirmPassword: z.string().min(1, { message: "Şifre tekrarı zorunludur" }),
		clinicId: z.string().min(1, { message: "Klinik seçimi zorunludur" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Şifreler eşleşmiyor",
		path: ["confirmPassword"],
	});

export const updateSchema = baseUserSchema.omit({ role: true, password: true }).extend({
	id: z.string(),
});

export const deleteSchema = z.object({
	id: z.string(),
});
