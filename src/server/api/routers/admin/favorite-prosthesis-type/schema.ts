import { z } from "zod";

export const addFavoriteSchema = z.object({
	prosthesisTypeId: z.string(),
	order: z.number().optional(),
});

export const updateFavoriteOrderSchema = z.object({
	id: z.string(),
	order: z.number(),
});

export const removeFavoriteSchema = z.object({
	id: z.string(),
});

export const getFavoritesSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
});