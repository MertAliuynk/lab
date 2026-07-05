import { z } from "zod";

export const getFeedbacksSchema = z.object({
	page: z.number().min(1).default(1),
	perPage: z.number().min(1).max(100).default(10),
});

export const deleteFeedbackSchema = z.object({
	feedbackId: z.string(),
});