import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";

export const favoriteProsthesisTypeRouter = createTRPCRouter({
	getAll: dentistProcedure.query(async ({ ctx }) => {
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
		});

		return favorites;
	}),
});