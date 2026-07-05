import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { addFavoriteSchema, updateFavoriteOrderSchema, removeFavoriteSchema, getFavoritesSchema } from "./schema";

export const favoriteProsthesisTypeRouter = createTRPCRouter({
	getAll: adminProcedure.input(getFavoritesSchema).query(async ({ ctx, input }) => {
		const favorites = await ctx.db.favoriteProsthesisType.findMany({
			where: {
				isDeleted: false,
			},
			include: {
				prosthesisType: true,
			},
			orderBy: [
				{ order: "asc" },
				{ createdAt: "desc" },
			],
			take: input.perPage || 50,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return favorites;
	}),

	add: adminProcedure.input(addFavoriteSchema).mutation(async ({ ctx, input }) => {
		// Aynı protez tipi zaten favori mi kontrol et
		const existing = await ctx.db.favoriteProsthesisType.findFirst({
			where: {
				prosthesisTypeId: input.prosthesisTypeId,
				isDeleted: false,
			},
		});

		if (existing) {
			throw new Error("Bu protez tipi zaten favoriler arasında");
		}

		// Eğer order belirtilmemişse, en son sıraya ekle
		let order = input.order;
		if (order === undefined) {
			const lastFavorite = await ctx.db.favoriteProsthesisType.findFirst({
				where: { isDeleted: false },
				orderBy: { order: "desc" },
			});
			order = (lastFavorite?.order || 0) + 1;
		}

		const favorite = await ctx.db.favoriteProsthesisType.create({
			data: {
				prosthesisTypeId: input.prosthesisTypeId,
				order,
			},
			include: {
				prosthesisType: true,
			},
		});

		return favorite;
	}),

	updateOrder: adminProcedure.input(updateFavoriteOrderSchema).mutation(async ({ ctx, input }) => {
		const favorite = await ctx.db.favoriteProsthesisType.update({
			where: {
				id: input.id,
			},
			data: {
				order: input.order,
			},
			include: {
				prosthesisType: true,
			},
		});

		return favorite;
	}),

	remove: adminProcedure.input(removeFavoriteSchema).mutation(async ({ ctx, input }) => {
		const favorite = await ctx.db.favoriteProsthesisType.update({
			where: {
				id: input.id,
			},
			data: {
				isDeleted: true,
			},
		});

		return favorite;
	}),
});