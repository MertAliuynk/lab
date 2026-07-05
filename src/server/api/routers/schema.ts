import { UserRole } from "@prisma/client";
import { z } from "zod";

export const baseUserSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: "Kullanıcı adı en az 2 karakter olmalıdır.",
		})
		.regex(/^[a-zA-Z0-9]+$/, "Kullanıcı adı boşluk ve türkçe karakter içeremez."),
	password: z.string().min(2, {
		message: "Şifre en az 2 karakter olmalıdır.",
	}),
	role: z.nativeEnum(UserRole),
	name: z.string().min(2, {
		message: "İsim en az 2 karakter olmalıdır.",
	}),
	email: z.string().optional(),
	phone: z.string().optional(),
	image: z.string().optional(),
});

export const updateUserSchema = z.object({
	name: z.string().min(3, "İsim en az 3 karakter olmalıdır"),
	username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
});

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(6, "Mevcut şifre en az 6 karakter olmalıdır"),
		newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
		confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Şifreler eşleşmiyor",
		path: ["confirmPassword"],
	});
