import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const prosthesisTypeRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const prosthesisTypes = await ctx.db.prosthesisType.findMany({
			where,
			orderBy: input.sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return prosthesisTypes;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisType.create({
			data: {
				name: input.name,
				description: input.description,
				defaultPrice: input.defaultPrice,
				pricingType: input.pricingType,
			},
		});
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisType.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description,
				defaultPrice: input.defaultPrice,
				pricingType: input.pricingType,
			},
		});
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisType.delete({
			where: { id: input.id },
		});
	}),
});
