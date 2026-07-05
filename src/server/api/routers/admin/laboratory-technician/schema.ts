import { baseUserSchema } from "@/server/api/routers/schema";
import { z } from "zod";

export const getAllSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	name: z.string().optional(),
	sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
});

export const createSchema = baseUserSchema
	.extend({
		specialization: z.string().optional(),
		confirmPassword: z.string().min(1, {
			message: "Şifre tekrarı boş bırakılamaz",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Şifreler eşleşmiyor",
		path: ["confirmPassword"],
	});

export const updateSchema = baseUserSchema.omit({ password: true }).extend({
	id: z.string(),
	specialization: z.string().optional(),
});

export const resetPasswordSchema = z.object({
	password: z.string().min(1, {
		message: "Şifre boş bırakılamaz",
	}),
	confirmPassword: z.string().min(1, {
		message: "Şifre tekrarı boş bırakılamaz",
	}),
});

export const deleteSchema = z.object({
	id: z.string(),
});
