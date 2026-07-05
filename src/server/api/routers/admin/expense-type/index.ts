import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";
import { createSchema, updateSchema } from "./schema";

export const expenseTypeRouter = createTRPCRouter({
	getAll: adminProcedure.query(async ({ ctx }) => {
		const expenseTypes = await ctx.db.expenseType.findMany({
			where: { isDeleted: false },
			orderBy: { name: "asc" },
		});
		return expenseTypes;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const expenseType = await ctx.db.expenseType.create({
			data: { name: input.name },
		});
		return expenseType;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const expenseType = await ctx.db.expenseType.update({
			where: { id: input.id },
			data: { name: input.name },
		});
		return expenseType;
	}),

	delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		await ctx.db.expenseType.update({
			where: { id: input.id },
			data: { isDeleted: true },
		});
		return true;
	}),
});
