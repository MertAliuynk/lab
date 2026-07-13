import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
import { recomputePatientCompletion } from "@/server/api/routers/_shared/patient-completion";
import { getAllPatientsSchema, getDentalWorksByPatientIdSchema, getPatientByIdSchema } from "./schema";
import { z } from "zod";

export const patientRouter = createTRPCRouter({
	getAll: laboratoryTechnicianProcedure.input(getAllPatientsSchema).query(async ({ ctx, input }) => {
		const where = {
			isDeleted: false,
			...(input.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {}),
		};

		const patients = await ctx.db.patient.findMany({
			where,
			include: {
				_count: {
					select: {
						dentalWorks: true,
					},
				},
				dentalWorks: {
					select: {
						id: true,
						selectedTeeth: true,
						prosthesisStage: true,
						prosthesisType: true,
						isCompleted: true,
						notes: true,
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
				clinic: {
					select: {
						name: true,
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
				};
			})
		);

		return patientsWithLastUpdate;
	}),

	getById: laboratoryTechnicianProcedure.input(getPatientByIdSchema).query(async ({ ctx, input }) => {
		const patient = await ctx.db.patient.findFirst({
			where: {
				id: input.id,
				isDeleted: false,
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				clinic: {
					select: {
						name: true,
					},
				},
			},
		});

		if (!patient) {
			throw new Error("Hasta bulunamadı");
		}

		return patient;
	}),

	getDentalWorks: laboratoryTechnicianProcedure.input(getDentalWorksByPatientIdSchema).query(async ({ ctx, input }) => {
		const dentalWorks = await ctx.db.dentalWork.findMany({
			where: {
				patientId: input.patientId,
				isDeleted: false,
			},
			include: {
				patient: true,
				prosthesisType: true,
				prosthesisStage: true,
				toothColor: true,
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				laboratoryTechnician: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				dentalWorkAdditionalTreatments: {
					include: {
						additionalTreatment: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return dentalWorks;
	}),

	markAsCompleted: laboratoryTechnicianProcedure
		.input(z.object({ dentalWorkId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const dentalWork = await ctx.db.dentalWork.update({
				where: { id: input.dentalWorkId },
				data: {
					isCompleted: true,
				},
				include: {
					prosthesisType: true,
					dentist: true,
				},
			});

			await ctx.db.technicianStageHistory.create({
				data: {
					dentalWorkId: dentalWork.id,
					technicianStageId: null, // Özel durum: bitim kaydı
					notes: "BITIM_YAPILDI", // Özel işaretleyici
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
			});

			// Bu protez için ödeme kaydı oluştur
			const unitPrice = Number(dentalWork.unitPrice || 0);
			const totalPrice = Number(dentalWork.totalPrice || 0);

			if (totalPrice > 0) {
				// Mevcut ödeme kaydı var mı kontrol et
				const existingPayment = await ctx.db.payment.findFirst({
					where: {
						dentalWorkId: dentalWork.id,
					},
				});

				// Eğer ödeme kaydı yoksa oluştur
				if (!existingPayment) {
					let quantity = 1;
					if (dentalWork.prosthesisType.pricingType === "JAW_BASED") {
						quantity = dentalWork.selectedJaws?.length || 1;
					} else {
						quantity = dentalWork.selectedTeeth?.length || 1;
					}

					const paymentNotes =
						dentalWork.prosthesisType.pricingType === "JAW_BASED"
							? `${dentalWork.id} - Hasta bitimi ile eklenen ödeme (${quantity} çene x ₺${unitPrice})`
							: `${dentalWork.id} - Hasta bitimi ile eklenen ödeme (${quantity} diş x ₺${unitPrice})`;

					await ctx.db.payment.create({
						data: {
							amount: totalPrice,
							paymentDate: new Date(),
							paymentType: "CASH",
							notes: paymentNotes,
							dentistId: dentalWork.dentistId,
							clinicId: dentalWork.dentist.clinicId,
							dentalWorkId: dentalWork.id,
						},
					});
				}
			}

			// Hastanın tüm tedavileri bitti mi diye kontrol edip hasta durumunu güncelle
			await recomputePatientCompletion(dentalWork.patientId);

			return dentalWork;
		}),

	markAsOngoing: laboratoryTechnicianProcedure
		.input(z.object({ dentalWorkId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const dentalWork = await ctx.db.dentalWork.update({
				where: { id: input.dentalWorkId },
				data: {
					isCompleted: false,
				},
			});

			await ctx.db.technicianStageHistory.deleteMany({
				where: {
					dentalWorkId: dentalWork.id,
					notes: "BITIM_YAPILDI",
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
			});
			// Yeni technician history kaydı ekle
			await ctx.db.technicianStageHistory.create({
				data: {
					dentalWorkId: dentalWork.id,
					technicianStageId: null,
					notes: "TEKRAR_DOKTORA_VERILDI",
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
			});

			// Bu protez için otomatik oluşturulmuş ödeme kaydını sil
			await ctx.db.payment.deleteMany({
				where: {
					dentalWorkId: dentalWork.id,
					notes: {
						contains: "Hasta bitimi ile eklenen ödeme",
					},
				},
			});

			// Hastanın tüm tedavileri bitti mi diye kontrol edip hasta durumunu güncelle
			await recomputePatientCompletion(dentalWork.patientId);

			return dentalWork;
		}),
});
