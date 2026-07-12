import { z } from "zod";

export const getDentalWorksSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	patientId: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	onlyCompleted: z.boolean().optional(),
});

export const getDentalWorksByPatientIdSchema = z.object({
	patientId: z.string(),
});

export const getStageHistorySchema = z.object({
	dentalWorkId: z.string(),
});

export const getTechnicianStageHistorySchema = z.object({
	dentalWorkId: z.string(),
});

export const createDentalWorkSchema = z
	.object({
		patientId: z.string().optional(),
		patientName: z.string().optional(),
		dentistId: z.string().optional(),
		prosthesisTypeId: z.string(),
		prosthesisStageId: z.string().optional(),
		toothColorId: z.string().optional(),
		jawType: z.enum(["UPPER", "LOWER"]).optional(),
		notes: z.string().optional(),
		deliveryDate: z.date().optional(),
		selectedTeeth: z.array(z.string()).optional(),
		selectedJaws: z.array(z.string()).optional(),
		attachments: z
			.array(
				z.object({
					url: z.string(),
					name: z.string(),
					type: z.enum(["image", "video"]),
				}),
			)
			.optional(),
	})
	.refine((data) => data.patientId || data.patientName, {
		message: "Hasta ID'si veya hasta adı gereklidir",
	});

export const updateDentalWorkStageSchema = z.object({
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

export const getByIdSchema = z.object({
	dentalWorkId: z.string(),
});

export const getClinicPricesForProsthesisTypesSchema = z.object({
	prosthesisTypeIds: z.array(z.string()),
});

export const deleteDentalWorkSchema = z.object({
	id: z.string(),
});

export const updateDeliveryDateSchema = z.object({
	dentalWorkId: z.string(),
	deliveryDate: z.date(),
});

export const deleteStageHistorySchema = z.object({
	stageHistoryId: z.string(),
});
