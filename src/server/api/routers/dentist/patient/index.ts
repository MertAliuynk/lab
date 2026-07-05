
import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";
import { getMyPatientsSchema, getPatientByIdSchema, updatePatientNotesSchema, markAsCompletedSchema, sendToTechnicianSchema } from "./schema";

export const patientRouter = createTRPCRouter({
	sendToTechnician: dentistProcedure.input(sendToTechnicianSchema).mutation(async ({ ctx, input }) => {
		// Hastayı tekrar teknisyene/kuryeye gönder
		const updated = await ctx.db.patient.update({
			where: { id: input.id },
			data: {
				isSentToTechnician: true,
				lastSentToTechnicianAt: new Date(),
			},
		});
		return updated;
	}),
	getMy: dentistProcedure.input(getMyPatientsSchema).query(async ({ ctx, input }) => {
		const where = {
			dentistId: ctx.dentist!.id,
			isDeleted: false,
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const patients = await ctx.db.patient.findMany({
			where,
			include: {
				_count: {
					select: {
						dentalWorks: true,
						patientFeedbacks: true,
					},
				},
				dentalWorks: {
					select: {
						id: true,
						selectedTeeth: true,
						selectedJaws: true,
						jawType: true,
						prosthesisType: true,
						prosthesisStage: true,
						isCompleted: true,
						notes: true,
					},
				},
				patientFeedbacks: {
					select: {
						id: true,
						createdAt: true,
					},
				},
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
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		// Her hasta için en son aşama güncellemesini kim yaptı bilgisini al
		const patientsWithLastUpdate = await Promise.all(
			patients.map(async (patient) => {
				let lastUpdateBy: 'doctor' | 'technician' | null = null;
				let lastUpdateDate: Date | null = null;

				// Hastanın tüm dental work'leri için en son aşama güncellemelerini kontrol et
				for (const dentalWork of patient.dentalWorks) {
					// Prosthesis stage history kontrol et
					const prosthesisHistory = await ctx.db.stageHistory.findFirst({
						where: { dentalWorkId: dentalWork.id },
						orderBy: { createdAt: 'desc' },
					});

					// Technician stage history kontrol et
					const technicianHistory = await ctx.db.technicianStageHistory.findFirst({
						where: { dentalWorkId: dentalWork.id },
						orderBy: { createdAt: 'desc' },
					});

					// En son güncellemeyi bul
					const updates = [];
					if (prosthesisHistory) {
						updates.push({ date: prosthesisHistory.createdAt, type: 'doctor' as const });
					}
					if (technicianHistory) {
						updates.push({ date: technicianHistory.createdAt, type: 'technician' as const });
					}

					if (updates.length > 0) {
						const latestUpdate = updates.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
						if (latestUpdate && (!lastUpdateDate || latestUpdate.date > lastUpdateDate)) {
							lastUpdateDate = latestUpdate.date;
							lastUpdateBy = latestUpdate.type;
						}
					}
				}

				return {
					...patient,
					lastUpdateBy,
					lastUpdateDate,
					hasFeedback: patient.patientFeedbacks && patient.patientFeedbacks.length > 0,
				};
			})
		);

		return patientsWithLastUpdate;
	}),

	getById: dentistProcedure.input(getPatientByIdSchema).query(async ({ ctx, input }) => {
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
			},
		});

		return patient;
	}),

	updateNotes: dentistProcedure.input(updatePatientNotesSchema).mutation(async ({ ctx, input }) => {
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
			},
		});

		if (!patient) {
			throw new Error("Hasta bulunamadı veya bu hastaya erişim yetkiniz yok");
		}

		const updatedPatient = await ctx.db.patient.update({
			where: { id: input.id },
			data: { notes: input.notes },
		});

		return updatedPatient;
	}),

	markAsCompleted: dentistProcedure.input(markAsCompletedSchema).mutation(async ({ ctx, input }) => {
		// Önce hastanın bu doktora ait olduğunu kontrol et
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
			},
			include: {
				dentalWorks: {
					where: {
						isDeleted: false,
					},
					include: {
						prosthesisType: true,
						dentist: true,
					},
				},
			},
		});

		if (!patient) {
			throw new Error("Hasta bulunamadı veya bu hastaya erişim yetkiniz yok");
		}

		// Hasta tamamlandı olarak işaretle
		const updatedPatient = await ctx.db.patient.update({
			where: { id: input.id },
			data: {
				isCompleted: true,
				completedAt: new Date(),
			},
		});

		// Tüm dental work'ler için hem bitim kaydı ekle hem de isCompleted alanını güncelle
		for (const dentalWork of patient.dentalWorks) {
			await ctx.db.dentalWork.update({
				where: { id: dentalWork.id },
				data: {
					isCompleted: true,
				},
			});
			await ctx.db.stageHistory.create({
				data: {
					dentalWorkId: dentalWork.id,
					prosthesisStageId: null, // Özel durum: bitim kaydı
					notes: "BITIM_YAPILDI", // Özel işaretleyici
					dentistId: ctx.dentist!.id,
				},
			});
		}

		return updatedPatient;
	}),

});
