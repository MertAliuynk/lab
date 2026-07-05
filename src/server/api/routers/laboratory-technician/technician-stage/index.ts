import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const technicianStageRouter = createTRPCRouter({
	getAll: laboratoryTechnicianProcedure.input(z.object({})).query(async ({ ctx }) => {
		return await ctx.db.technicianStage.findMany({
			orderBy: {
				order: "asc",
			},
		});
	}),
});