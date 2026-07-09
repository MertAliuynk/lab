import { z } from "zod";

export const getAllDentalWorksSchema = z.object({
	page: z.number().optional(),
	perPage: z.number().optional(),
	patientId: z.string().optional(),
});

export const getDentalWorkByIdSchema = z.object({
	id: z.string(),
});

export const getStageHistorySchema = z.object({
	dentalWorkId: z.string(),
});

export const getTechnicianStageHistorySchema = z.object({
	dentalWorkId: z.string(),
});

export const updateTechnicianStageSchema = z.object({
	dentalWorkId: z.string(),
	technicianStageId: z.string().optional(),
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

export const addAdditionalTreatmentSchema = z.object({
	dentalWorkId: z.string(),
	additionalTreatmentId: z.string(),
	quantity: z.number().min(1),
	price: z.number().optional(),
	notes: z.string().optional(),
});

export const removeAdditionalTreatmentSchema = z.object({
	dentalWorkId: z.string(),
	id: z.string(), // Junction table record ID'si
});

export const getAdditionalTreatmentsSchema = z.object({
	dentalWorkId: z.string(),
});
export const getDentalWorksByDeliveryDateSchema = z.object({
	date: z.date(),                    // Seçilen tarih
	clinicId: z.string().optional(),
	dentistId: z.string().optional(),
	page: z.number().optional().default(1),
	perPage: z.number().optional().default(20),
});


export const createProsthesisSchema = z
	.object({
		patientId: z.string(),
		prosthesisTypeId: z.string(),
		prosthesisStageId: z.string().optional(),
		toothColorId: z.string().optional(),
		jawType: z.enum(["UPPER", "LOWER"]).optional(),
		notes: z.string().optional(),
		deliveryDate: z.date().optional(),
		selectedTeeth: z.array(z.string()).optional(),
		selectedJaws: z.array(z.string()).optional(),
	});

export const deleteProsthesisSchema = z.object({
	id: z.string(),
});