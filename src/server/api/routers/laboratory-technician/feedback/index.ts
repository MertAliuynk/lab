import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
import { getFeedbacksSchema, deleteFeedbackSchema } from "./schema";

export const feedbackRouter = createTRPCRouter({
	// Teknisyene gelen tüm feedbackleri getir
	getAll: laboratoryTechnicianProcedure
		.input(getFeedbacksSchema)
		.query(async ({ ctx, input }) => {
			const { page, perPage } = input;
			const skip = (page - 1) * perPage;

			// Toplam feedback sayısı - Tüm feedbackler
			const total = await ctx.db.patientFeedback.count({
				where: {
					isDeleted: false, // Sadece silinmemiş feedbackleri say
				},
			});

			// Tüm feedbackleri getir
			const feedbacks = await ctx.db.patientFeedback.findMany({
				where: {
					isDeleted: false, // Sadece silinmemiş feedbackleri getir
				},
				include: {
					patient: true,
					dentist: {
						include: {
							user: true,
							clinic: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take: perPage,
			});

			const totalPages = Math.ceil(total / perPage);

			return {
				feedbacks,
				pagination: {
					page,
					perPage,
					total,
					totalPages,
				},
			};
		}),

	// Specific patient için feedbackleri getir
	getByPatient: laboratoryTechnicianProcedure
		.input(z.object({ patientId: z.string() }))
		.query(async ({ ctx, input }) => {
			const feedbacks = await ctx.db.patientFeedback.findMany({
				where: {
					patientId: input.patientId,
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
				include: {
					dentist: {
						include: {
							user: true,
							clinic: true,
						},
					},
					patient: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			return feedbacks;
		}),

	// Feedback sayılarını getir
	getStats: laboratoryTechnicianProcedure
		.query(async ({ ctx }) => {
			const total = await ctx.db.patientFeedback.count({
				where: {
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
			});

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const todayCount = await ctx.db.patientFeedback.count({
				where: {
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
					createdAt: {
						gte: today,
					},
				},
			});

			const thisWeekStart = new Date(today);
			thisWeekStart.setDate(today.getDate() - today.getDay());

			const thisWeekCount = await ctx.db.patientFeedback.count({
				where: {
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
					createdAt: {
						gte: thisWeekStart,
					},
				},
			});

			return {
				total,
				today: todayCount,
				thisWeek: thisWeekCount,
			};
		}),

	// Feedback sil (soft delete)
	delete: laboratoryTechnicianProcedure
		.input(deleteFeedbackSchema)
		.mutation(async ({ ctx, input }) => {
			// Feedback'in var olduğunu kontrol et
			const feedback = await ctx.db.patientFeedback.findFirst({
				where: {
					id: input.feedbackId,
					isDeleted: false,
				},
			});

			if (!feedback) {
				throw new Error("Feedback bulunamadı");
			}

			// Soft delete
			await ctx.db.patientFeedback.update({
				where: {
					id: input.feedbackId,
				},
				data: {
					isDeleted: true,
				},
			});

			return { success: true };
		}),
});

import { z } from "zod";