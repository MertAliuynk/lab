import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const technicianStageRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			isDeleted: false,
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const technicianStages = await ctx.db.technicianStage.findMany({
			where,
			orderBy: input.sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return technicianStages;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.technicianStage.create({
			data: {
				name: input.name,
				description: input.description,
			},
		});
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.technicianStage.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description,
			},
		});
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.technicianStage.update({
			where: { id: input.id },
			data: { isDeleted: true },
		});
	}),
});