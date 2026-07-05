import { z } from "zod";

export const getAllSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	patientId: z.string().optional(),
	dentistId: z.string().optional(),
	clinicId: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
});

export const getByIdSchema = z.object({
	id: z.string(),
});

export const getByPatientIdSchema = z.object({
	patientId: z.string(),
});

export const getStageHistorySchema = z.object({
	dentalWorkId: z.string(),
});

export const updateStageSchema = z.object({
	dentalWorkId: z.string(),
	prosthesisStageId: z.string(),
	notes: z.string().optional(),
	attachments: z
		.array(
			z.object({
				url: z.string(),
				name: z.string(),
				type: z.enum(["image", "video"]),
			}),
		)
		.optional(),
});

export const updateDentalWorkSchema = z.object({
	dentalWorkId: z.string(),
	prosthesisStageId: z.string().optional(),
	toothColorId: z.string().optional(),
	jawType: z.enum(["UPPER", "LOWER"]).optional(),
	notes: z.string().optional(),
	deliveryDate: z.date().optional(),
	selectedTeeth: z.array(z.string()).optional(),
	selectedJaws: z.array(z.string()).optional(),
});

export const deleteStageHistorySchema = z.object({
	stageHistoryId: z.string(),
});

export const getClinicPricesForProsthesisTypesSchema = z.object({
	prosthesisTypeIds: z.array(z.string()),
});
