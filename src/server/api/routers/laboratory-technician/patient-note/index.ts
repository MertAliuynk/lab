import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
import { getPatientNotesSchema } from "./schema";

export const patientNoteRouter = createTRPCRouter({
	getByPatientId: laboratoryTechnicianProcedure.input(getPatientNotesSchema).query(async ({ ctx, input }) => {
		// Teknisyenin bu hastaya erişimi var mı kontrol et (dentalWork üzerinden)
		const hasAccess = await ctx.db.dentalWork.findFirst({
			where: {
				patientId: input.patientId,
				OR: [
					{ laboratoryTechnicianId: ctx.laboratoryTechnician.id },
					{ laboratoryTechnicianId: null }, // Henüz atanmamış işler
				],
			},
		});

		if (!hasAccess) {
			throw new Error("Bu hastaya erişim yetkiniz yok");
		}

		const patientNotes = await ctx.db.patientNote.findMany({
			where: {
				patientId: input.patientId,
				isDeleted: false,
			},
			include: {
				dentist: {
					include: {
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return patientNotes;
	}),
});