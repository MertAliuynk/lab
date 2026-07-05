import { z } from "zod";

export const getPaymentsSchema = z.object({
	page: z.number().optional().default(1),
	perPage: z.number().optional().default(10),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
});
