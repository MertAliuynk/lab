import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const prosthesisStageRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const prosthesisStages = await ctx.db.prosthesisStage.findMany({
			where,
			orderBy: input.sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return prosthesisStages;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisStage.create({
			data: {
				name: input.name,
				description: input.description,
				percentage: input.percentage,
				price: input.price,
			},
		});
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisStage.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description,
				percentage: input.percentage,
				price: input.price,
			},
		});
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.prosthesisStage.delete({
			where: { id: input.id },
		});
	}),
});
