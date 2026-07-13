import { z } from "zod";

export const createFeedbackSchema = z.object({
	patientId: z.string(),
	dentalWorkId: z.string().optional(),
	feedbackText: z.string().optional(),
	laboratoryTechnicianId: z.string().optional(),
	// 5 puanlama kategorisi (1-5 arası)
	infrastructureRating: z.number().int().min(1).max(5),
	speedRating: z.number().int().min(1).max(5),
	colorRating: z.number().int().min(1).max(5),
	designRating: z.number().int().min(1).max(5),
	aestheticsRating: z.number().int().min(1).max(5),
});

export const getFeedbacksSchema = z.object({
	patientId: z.string(),
	dentalWorkId: z.string().optional(),
});

export const deleteFeedbackSchema = z.object({
	feedbackId: z.string(),
});