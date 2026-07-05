import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";

import { dentalWorkRouter } from "./dental-work";
import { patientRouter } from "./patient";
import { technicianStageRouter } from "./technician-stage";
import { feedbackRouter } from "./feedback";
import { patientNoteRouter } from "./patient-note";

export const laboratoryTechnicianRouter = createTRPCRouter({
	me: laboratoryTechnicianProcedure.query(async ({ ctx }) => {
		return ctx.laboratoryTechnician;
	}),

	// Ek tedavileri getir
	getAdditionalTreatments: laboratoryTechnicianProcedure.query(async ({ ctx }) => {
		const additionalTreatments = await ctx.db.additionalTreatment.findMany({
			where: {
				isDeleted: false,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return additionalTreatments;
	}),

	// Protez tiplerini getir
	getProsthesisTypes: laboratoryTechnicianProcedure.query(async ({ ctx }) => {
		const prosthesisTypes = await ctx.db.prosthesisType.findMany({
			where: {
				isDeleted: false,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return prosthesisTypes;
	}),

	// Protez aşamalarını getir
	getProsthesisStages: laboratoryTechnicianProcedure.query(async ({ ctx }) => {
		const prosthesisStages = await ctx.db.prosthesisStage.findMany({
			where: {
				isDeleted: false,
			},
			orderBy: {
				order: 'asc',
			},
		});

		return prosthesisStages;
	}),

	// Diş renklerini getir
	getToothColors: laboratoryTechnicianProcedure.query(async ({ ctx }) => {
		const toothColors = await ctx.db.toothColor.findMany({
			where: {
				isDeleted: false,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return toothColors;
	}),

	dentalWork: dentalWorkRouter,
	patient: patientRouter,
	technicianStage: technicianStageRouter,
	feedback: feedbackRouter,
	patientNote: patientNoteRouter,
});
