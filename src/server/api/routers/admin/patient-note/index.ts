import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

export const patientNoteRouter = createTRPCRouter({
	getByPatientId: adminProcedure.input(z.object({ patientId: z.string() })).query(async ({ ctx, input }) => {
		return ctx.db.patientNote.findMany({
			where: { patientId: input.patientId },
			orderBy: { createdAt: "desc" },
		});
	}),
});
