import { z } from "zod";

export const resetPasswordSchema = z.object({
	userId: z.string(),
	password: z.string().min(1, {
		message: "Şifre boş bırakılamaz",
	}),
	confirmPassword: z.string().min(1, {
		message: "Şifre tekrarı boş bırakılamaz",
	}),
});
