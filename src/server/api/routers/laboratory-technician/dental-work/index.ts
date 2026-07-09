import { createTRPCRouter, laboratoryTechnicianProcedure } from "@/server/api/trpc";
import {
	getAllDentalWorksSchema,
	getDentalWorkByIdSchema,
	getStageHistorySchema,
	getTechnicianStageHistorySchema,
	updateTechnicianStageSchema,
	addAdditionalTreatmentSchema,
	removeAdditionalTreatmentSchema,
	getAdditionalTreatmentsSchema,
	createProsthesisSchema,
	deleteProsthesisSchema,
	getDentalWorksByDeliveryDateSchema
} from "./schema";

export const dentalWorkRouter = createTRPCRouter({
	getAll: laboratoryTechnicianProcedure.input(getAllDentalWorksSchema).query(async ({ ctx, input }) => {
		const where = {
			isDeleted: false,
			...(input.patientId ? { patientId: input.patientId } : {}),
		};

		const dentalWorks = await ctx.db.dentalWork.findMany({
			where,
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
			},
			orderBy: { createdAt: "desc" },
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return dentalWorks;
	}),

	getById: laboratoryTechnicianProcedure.input(getDentalWorkByIdSchema).query(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.id,
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
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		return dentalWork;
	}),

	getStageHistory: laboratoryTechnicianProcedure.input(getStageHistorySchema).query(async ({ ctx, input }) => {
		const stageHistory = await ctx.db.stageHistory.findMany({
			where: {
				dentalWorkId: input.dentalWorkId,
			},
			include: {
				prosthesisStage: true,
				laboratoryTechnician: {
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
		});

		return stageHistory;
	}),



	getTechnicianStageHistory: laboratoryTechnicianProcedure.input(getTechnicianStageHistorySchema).query(async ({ ctx, input }) => {
		const technicianStageHistory = await ctx.db.technicianStageHistory.findMany({
			where: {
				dentalWorkId: input.dentalWorkId,
			},
			include: {
				technicianStage: true,
				laboratoryTechnician: {
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
		});

		return technicianStageHistory;
	}),

	updateTechnicianStage: laboratoryTechnicianProcedure.input(updateTechnicianStageSchema).mutation(async ({ ctx, input }) => {
		// Laboratuvar teknisyenini bul
		const laboratoryTechnician = await ctx.db.laboratoryTechnician.findFirst({
			where: { userId: ctx.session.user.id },
		});

		if (!laboratoryTechnician) {
			throw new Error("Laboratuvar teknisyeni bulunamadı");
		}

		// DentalWork'ü güncelle

		// Eğer notlardan biri 'KURYEE_VERILDI', 'KURYE_VERILDI', 'TEKRAR_DOKTORA_VERILDI' ise hem dentalWork hem de technicianStageHistory'ye bu notu yaz
		const kuryeNotes = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI"];
		const isKuryeVerildi = input.notes && kuryeNotes.includes(input.notes);

		await ctx.db.dentalWork.update({
			where: { id: input.dentalWorkId },
			data: {
				technicianStageId: input.technicianStageId,
				laboratoryTechnicianId: laboratoryTechnician.id,
				...(isKuryeVerildi ? { notes: input.notes } : {}),
			},
		});

		// TechnicianStageHistory oluştur
		await ctx.db.technicianStageHistory.create({
			data: {
				dentalWorkId: input.dentalWorkId,
				technicianStageId: input.technicianStageId,
				laboratoryTechnicianId: laboratoryTechnician.id,
				notes: input.notes,
				attachments: input.attachments || [],
			},
		});

		return { success: true };
	}),

	// Ek tedavi işlemleri
	getAdditionalTreatments: laboratoryTechnicianProcedure
		.input(getAdditionalTreatmentsSchema)
		.query(async ({ ctx, input }) => {
			const additionalTreatments = await ctx.db.dentalWorkAdditionalTreatment.findMany({
				where: {
					dentalWorkId: input.dentalWorkId,
				},
				include: {
					additionalTreatment: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			return additionalTreatments;
		}),

	addAdditionalTreatment: laboratoryTechnicianProcedure
		.input(addAdditionalTreatmentSchema)
		.mutation(async ({ ctx, input }) => {
			// Yeni ek tedavi ekle (aynı tedaviyi birden fazla kez ekleyebilir)
			const result = await ctx.db.dentalWorkAdditionalTreatment.create({
				data: {
					dentalWorkId: input.dentalWorkId,
					additionalTreatmentId: input.additionalTreatmentId,
					quantity: input.quantity,
					price: input.price,
					notes: input.notes,
				},
				include: {
					additionalTreatment: true,
				},
			});

			return result;
		}),

	removeAdditionalTreatment: laboratoryTechnicianProcedure
		.input(removeAdditionalTreatmentSchema)
		.mutation(async ({ ctx, input }) => {
			// Junction table'dan belirli kaydı sil
			await ctx.db.dentalWorkAdditionalTreatment.delete({
				where: {
					id: input.id,
				},
			});

			return { success: true };
		}),
	getByDeliveryDate: laboratoryTechnicianProcedure
		.input(getDentalWorksByDeliveryDateSchema)
		.query(async ({ ctx, input }) => {
			const { date, clinicId, dentistId, page = 1, perPage = 20 } = input;
			const skip = (page - 1) * perPage;

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const where: any = {
				isDeleted: false,
				deliveryDate: {
					gte: startOfDay,
					lt: endOfDay,
				},
			};

			if (clinicId) {
				where.dentist = { clinicId };
			}
			if (dentistId) {
				where.dentistId = dentistId;
			}

			const [dentalWorks, total] = await Promise.all([
				ctx.db.dentalWork.findMany({
					where,
					include: {
						patient: true,
						prosthesisType: true,
						prosthesisStage: true,
						toothColor: true,
						dentist: {
							include: {
								user: true,
								clinic: true,
							},
						},
						laboratoryTechnician: true,
					},
					orderBy: [{ deliveryDate: "asc" }, { createdAt: "desc" }],
					skip,
					take: perPage,
				}),
				ctx.db.dentalWork.count({ where }),
			]);

			return {
				dentalWorks,
				pagination: {
					page,
					perPage,
					total,
					totalPages: Math.ceil(total / perPage),
				},
			};
		}),

	createProsthesis: laboratoryTechnicianProcedure
		.input(createProsthesisSchema)
		.mutation(async ({ ctx, input }) => {
			// Hastanın doktor bilgisini al
			const patient = await ctx.db.patient.findUnique({
				where: { id: input.patientId },
				include: { dentist: true },
			});

			if (!patient) {
				throw new Error("Hasta bulunamadı");
			}

			// Protez tipini kontrol et
			const prosthesisType = await ctx.db.prosthesisType.findUnique({
				where: { id: input.prosthesisTypeId },
			});

			if (!prosthesisType) {
				throw new Error("Protez tipi bulunamadı");
			}

			// Klinik fiyatını al
			const clinicPrice = await ctx.db.clinicProsthesisPrice.findUnique({
				where: {
					clinicId_prosthesisTypeId: {
						clinicId: patient.dentist.clinicId,
						prosthesisTypeId: input.prosthesisTypeId,
					},
				},
			});

			const unitPrice = clinicPrice?.price || prosthesisType.defaultPrice || 0;
			let totalPrice = 0;
			let quantity = 1;

			// Fiyat hesaplama
			if (prosthesisType.pricingType === "JAW_BASED") {
				quantity = input.selectedJaws?.length || 1;
				totalPrice = unitPrice * quantity;
			} else {
				quantity = input.selectedTeeth?.length || 1;
				totalPrice = unitPrice * quantity;
			}

			// Protez oluştur
			const dentalWork = await ctx.db.dentalWork.create({
				data: {
					dentistId: patient.dentistId,
					patientId: input.patientId,
					prosthesisTypeId: input.prosthesisTypeId,
					prosthesisStageId: input.prosthesisStageId,
					toothColorId: input.toothColorId,
					jawType: input.jawType,
					notes: input.notes,
					deliveryDate: input.deliveryDate,
					selectedTeeth: input.selectedTeeth,
					selectedJaws: input.selectedJaws,
					unitPrice: unitPrice,
					totalPrice: totalPrice,
					laboratoryTechnicianId: ctx.laboratoryTechnician.id,
				},
			});

			// Eğer aşama seçildiyse aşama geçmişi oluştur
			if (input.prosthesisStageId) {
				await ctx.db.stageHistory.create({
					data: {
						dentalWorkId: dentalWork.id,
						prosthesisStageId: input.prosthesisStageId,
						...(input.notes ? { notes: input.notes } : {}),
					},
				});
			}

			// NOT: Ödeme kaydı hasta bitimi yapıldığında oluşturulacak

			return dentalWork;
		}),

	deleteProsthesis: laboratoryTechnicianProcedure
		.input(deleteProsthesisSchema)
		.mutation(async ({ ctx, input }) => {
			// Protezi soft delete yap
			await ctx.db.dentalWork.update({
				where: {
					id: input.id,
				},
				data: {
					isDeleted: true,
				},
			});

			return { success: true };
		}),
});
