import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";
import {
	createPatientNoteSchema,
	deletePatientNoteSchema,
	getPatientNotesSchema,
	updatePatientNoteSchema,
} from "./schema";

export const patientNoteRouter = createTRPCRouter({
	getByPatientId: dentistProcedure.input(getPatientNotesSchema).query(async ({ ctx, input }) => {
		// Önce hastanın bu diş hekimine ait olduğunu kontrol et
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.patientId,
				dentistId: ctx.dentist!.id,
			},
		});

		if (!patient) {
			throw new Error("Hasta bulunamadı veya bu hastaya erişim yetkiniz yok");
		}

		const patientNotes = await ctx.db.patientNote.findMany({
			where: {
				patientId: input.patientId,
				isDeleted: false,
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return patientNotes;
	}),

	create: dentistProcedure.input(createPatientNoteSchema).mutation(async ({ ctx, input }) => {
		// Önce hastanın bu diş hekimine ait olduğunu kontrol et
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.patientId,
				dentistId: ctx.dentist!.id,
			},
		});

		if (!patient) {
			throw new Error("Hasta bulunamadı veya bu hastaya erişim yetkiniz yok");
		}

		const patientNote = await ctx.db.patientNote.create({
			data: {
				content: input.content,
				patientId: input.patientId,
				dentistId: ctx.dentist!.id,
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		return patientNote;
	}),

	update: dentistProcedure.input(updatePatientNoteSchema).mutation(async ({ ctx, input }) => {
		// Önce notun bu diş hekimine ait olduğunu kontrol et
		const existingNote = await ctx.db.patientNote.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
				isDeleted: false,
			},
		});

		if (!existingNote) {
			throw new Error("Not bulunamadı veya bu nota erişim yetkiniz yok");
		}

		const updatedNote = await ctx.db.patientNote.update({
			where: { id: input.id },
			data: { content: input.content },
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		return updatedNote;
	}),

	delete: dentistProcedure.input(deletePatientNoteSchema).mutation(async ({ ctx, input }) => {
		// Önce notun bu diş hekimine ait olduğunu kontrol et
		const existingNote = await ctx.db.patientNote.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
				isDeleted: false,
			},
		});

		if (!existingNote) {
			throw new Error("Not bulunamadı veya bu nota erişim yetkiniz yok");
		}

		await ctx.db.patientNote.update({
			where: { id: input.id },
			data: { isDeleted: true },
		});

		return true;
	}),
});
