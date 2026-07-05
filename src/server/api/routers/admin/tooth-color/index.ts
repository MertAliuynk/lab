import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const toothColorRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const toothColors = await ctx.db.toothColor.findMany({
			where,
			orderBy: input.sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return toothColors;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const toothColor = await ctx.db.toothColor.create({
			data: {
				name: input.name,
				description: input.description,
			},
		});

		return toothColor;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const toothColor = await ctx.db.toothColor.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description,
			},
		});

		return toothColor;
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.toothColor.delete({
			where: { id: input.id },
		});
	}),
});
