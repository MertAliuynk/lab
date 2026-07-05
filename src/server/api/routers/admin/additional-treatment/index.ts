import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const additionalTreatmentRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const additionalTreatments = await ctx.db.additionalTreatment.findMany({
			where,
			orderBy: input.sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return additionalTreatments;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.additionalTreatment.create({
			data: {
				name: input.name,
				description: input.description,
				defaultPrice: input.defaultPrice,
			},
		});
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.additionalTreatment.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description,
				defaultPrice: input.defaultPrice,
			},
		});
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		await ctx.db.additionalTreatment.delete({
			where: { id: input.id },
		});
	}),
});