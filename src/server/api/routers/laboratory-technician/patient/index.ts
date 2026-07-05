import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
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
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Önce hastayı tamamlandı olarak işaretle
			const patient = await ctx.db.patient.update({
				where: { id: input.id },
				data: {
					isCompleted: true,
					completedAt: new Date(),
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

			// Tüm dental work'ler için hem bitim kaydı ekle hem de isCompleted alanını güncelle
			for (const dentalWork of patient.dentalWorks) {
				// DentalWork'ü de tamamlandı olarak işaretle
				await ctx.db.dentalWork.update({
					where: { id: dentalWork.id },
					data: {
						isCompleted: true,
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
			}

			// Bu hastanın tüm protezleri için ödeme kaydı oluştur
			for (const dentalWork of patient.dentalWorks) {
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
			}

			return patient;
		}),

	markAsOngoing: laboratoryTechnicianProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Hastayı devam eden duruma al
			const patient = await ctx.db.patient.update({
				where: { id: input.id },
				data: {
					isCompleted: false,
					completedAt: null,
				},
				include: {
					dentalWorks: {
						where: {
							isDeleted: false,
						},
					},
				},
			});

			// Bitim kayıtlarını sil ve yeni technician history ekle (tekrar doktora verildi)
			for (const dentalWork of patient.dentalWorks) {
				// DentalWork'ü de devam eden duruma al
				await ctx.db.dentalWork.update({
					where: { id: dentalWork.id },
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
			}

			// Bu hastanın protezleri için otomatik oluşturulmuş ödeme kayıtlarını sil
			for (const dentalWork of patient.dentalWorks) {
				await ctx.db.payment.deleteMany({
					where: {
						dentalWorkId: dentalWork.id,
						notes: {
							contains: "Hasta bitimi ile eklenen ödeme",
						},
					},
				});
			}

			return patient;
		}),
});
