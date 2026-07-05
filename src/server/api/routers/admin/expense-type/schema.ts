import { z } from "zod";

export const createSchema = z.object({
	name: z.string().min(1, { message: "Gider türü adı zorunludur" }),
});

export const updateSchema = z.object({
	id: z.string(),
	name: z.string().min(1, { message: "Gider türü adı zorunludur" }),
});
