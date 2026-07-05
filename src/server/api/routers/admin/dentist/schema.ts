import { baseUserSchema } from "@/server/api/routers/schema";
import { z } from "zod";

export const getAllSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
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

export const createSchema = baseUserSchema
	.omit({ role: true })
	.extend({
		title: z.string().optional(),
		clinicId: z.string().min(1, {
			message: "Klinik seçilmedi",
		}),
		confirmPassword: z.string().min(1, {
			message: "Şifre tekrarı boş bırakılamaz",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Şifreler eşleşmiyor",
		path: ["confirmPassword"],
	});

export const updateSchema = baseUserSchema.omit({ role: true, password: true }).extend({
	id: z.string(),
	title: z.string().optional(),
	clinicId: z.string().min(1, {
		message: "Klinik seçilmedi",
	}),
});

export const deleteSchema = z.object({
	id: z.string(),
});
