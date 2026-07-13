import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";
import { createFeedbackSchema, getFeedbacksSchema, deleteFeedbackSchema } from "./schema";

export const feedbackRouter = createTRPCRouter({
	create: dentistProcedure
		.input(createFeedbackSchema)
		.mutation(async ({ ctx, input }) => {
			const patient = await ctx.db.patient.findFirst({
				where: {
					id: input.patientId,
					dentistId: ctx.dentist!.id,
					isDeleted: false,
				},
			});

			if (!patient) {
				throw new Error("Hasta bulunamadı");
			}

			// Belirli bir tedavi için feedback veriliyorsa, o tedavinin tamamlandığını kontrol et
			let dentalWork: { laboratoryTechnicianId: string | null } | null = null;
			if (input.dentalWorkId) {
				dentalWork = await ctx.db.dentalWork.findFirst({
					where: {
						id: input.dentalWorkId,
						patientId: input.patientId,
						dentistId: ctx.dentist!.id,
						isCompleted: true,
						isDeleted: false,
					},
					select: {
						laboratoryTechnicianId: true,
					},
				});

				if (!dentalWork) {
					throw new Error("İşlem bulunamadı veya henüz tamamlanmamış");
				}
			}

			const technicianId = input.laboratoryTechnicianId || dentalWork?.laboratoryTechnicianId || null;

			// Normalize feedback text (schema allows optional) to avoid undefined issues during DB write and notification
			const feedbackText = input.feedbackText ?? "";

			// Feedback'i oluştur
			const feedback = await ctx.db.patientFeedback.create({
				data: {
					patientId: input.patientId,
					dentalWorkId: input.dentalWorkId ?? null,
					dentistId: ctx.dentist!.id,
					laboratoryTechnicianId: technicianId,
					feedbackText: feedbackText,
					infrastructureRating: input.infrastructureRating,
					speedRating: input.speedRating,
					colorRating: input.colorRating,
					designRating: input.designRating,
					aestheticsRating: input.aestheticsRating,
				},
				include: {
					patient: true,
					dentist: {
						include: {
							user: true,
							clinic: true,
						},
					},
					laboratoryTechnician: {
						include: {
							user: true,
						},
					},
				},
			});

			// Teknisyene bildirim gönder (eğer teknisyen varsa)
			if (feedback.laboratoryTechnician) {
				try {
					// Notification tablosuna kaydet
					const savedNotification = await ctx.db.notification.create({
						data: {
							patientName: feedback.patient.name,
							patientId: feedback.patientId,
							prosthesisType: "Doktor Geri Bildirimi", // Özel tip
							newStage: "Feedback Alındı",
							dentistName: feedback.dentist.user.name,
							clinicName: feedback.dentist.clinic.name,
							dentalWorkId: null, // Feedback için dental work yok
						},
					});

					// Teknisyene notification read kaydı oluştur
					await ctx.db.notificationRead.create({
						data: {
							notificationId: savedNotification.id,
							userId: feedback.laboratoryTechnician.userId,
							isRead: false,
						},
					});

					// Canlı bildirim gönder
					const notification = {
						id: savedNotification.id,
						patientName: feedback.patient.name,
						patientId: feedback.patientId,
						prosthesisType: "📝 Doktor Geri Bildirimi",
						newStage: `"${feedbackText.substring(0, 50)}${feedbackText.length > 50 ? '...' : ''}"`,
						dentistName: feedback.dentist.user.name,
						clinicName: feedback.dentist.clinic.name,
						laboratoryTechnicianId: feedback.laboratoryTechnician.userId,
						dentalWorkId: null,
						timestamp: savedNotification.createdAt,
						type: "feedbackUpdate",
					};

					try {
						await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(notification),
						});
					} catch (error) {
						console.error("Canlı bildirim gönderilirken hata:", error);
					}
				} catch (error) {
					console.error("Bildirim kaydedilirken hata:", error);
				}
			}

			return feedback;
		}),

	getByPatient: dentistProcedure
		.input(getFeedbacksSchema)
		.query(async ({ ctx, input }) => {
			// Hastanın bu doktora ait olduğunu kontrol et
			const patient = await ctx.db.patient.findFirst({
				where: {
					id: input.patientId,
					dentistId: ctx.dentist!.id,
					isDeleted: false,
				},
			});

			if (!patient) {
				throw new Error("Hasta bulunamadı");
			}

			const feedbacks = await ctx.db.patientFeedback.findMany({
				where: {
					patientId: input.patientId,
					dentistId: ctx.dentist!.id,
					isDeleted: false,
					...(input.dentalWorkId ? { dentalWorkId: input.dentalWorkId } : {}),
				},
				include: {
					dentist: {
						include: {
							user: true,
						},
					},
					laboratoryTechnician: {
						include: {
							user: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return feedbacks;
		}),

	delete: dentistProcedure
		.input(deleteFeedbackSchema)
		.mutation(async ({ ctx, input }) => {
			// Feedback'in bu doktora ait olduğunu kontrol et
			const feedback = await ctx.db.patientFeedback.findFirst({
				where: {
					id: input.feedbackId,
					dentistId: ctx.dentist!.id,
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