import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { DELIVERY_DATE_NOTE_PREFIX } from "@/lib/format";
import {
	deleteStageHistorySchema,
	getAllSchema,
	getByIdSchema,
	getByPatientIdSchema,
	getClinicPricesForProsthesisTypesSchema,
	getStageHistorySchema,
	updateDentalWorkSchema,
	updateStageSchema,
} from "./schema";

export const dentalWorkRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const where = {
			isDeleted: false,
			...(input.patientId ? { patientId: input.patientId } : {}),
			...(input.dentistId ? { dentistId: input.dentistId } : {}),
			...(input.clinicId ? { patient: { clinicId: input.clinicId } } : {}),
			...(input.startDate || input.endDate
				? {
						createdAt: {
							...(input.startDate ? { gte: input.startDate } : {}),
							...(input.endDate ? { lte: input.endDate } : {}),
						},
					}
				: {}),
		};

		const dentalWorks = await ctx.db.dentalWork.findMany({
			where,
			include: {
				   patient: true,
				   dentist: {
					   include: {
						   user: {
							   select: {
								   name: true,
							   },
						   },
					   },
				   },
				   prosthesisType: true,
				   prosthesisStage: true,
				   toothColor: true,
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
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return dentalWorks;
	}),

	getById: adminProcedure.input(getByIdSchema).query(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findUnique({
			where: {
				id: input.id,
				isDeleted: false,
			},
			include: {
				patient: true,
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				prosthesisType: true,
				prosthesisStage: true,
				toothColor: true,
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
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş çalışması bulunamadı",
			});
		}

		return dentalWork;
	}),

	getByPatientId: adminProcedure.input(getByPatientIdSchema).query(async ({ ctx, input }) => {
		const dentalWorks = await ctx.db.dentalWork.findMany({
			where: {
				patientId: input.patientId,
				isDeleted: false,
			},
			include: {
				patient: true,
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				prosthesisType: true,
				prosthesisStage: true,
				toothColor: true,
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

		return dentalWorks;
	}),

	getStageHistory: adminProcedure.input(getStageHistorySchema).query(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findUnique({
			where: {
				id: input.dentalWorkId,
				isDeleted: false,
			},
		});

		if (!dentalWork) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş çalışması bulunamadı",
			});
		}

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

	getClinicPricesForProsthesisTypes: adminProcedure
		.input(getClinicPricesForProsthesisTypesSchema)
		.query(async ({ ctx, input }) => {
			const clinicPrices = await ctx.db.clinicProsthesisPrice.findMany({
				where: {
					prosthesisTypeId: {
						in: input.prosthesisTypeIds,
					},
					isDeleted: false,
				},
				include: {
					prosthesisType: true,
					clinic: true,
				},
			});

			const priceMap: Record<string, number> = {};

			for (const price of clinicPrices) {
				const currentPrice = priceMap[price.prosthesisTypeId];
				if (!currentPrice || price.price > currentPrice) {
					priceMap[price.prosthesisTypeId] = price.price;
				}
			}

			const allProsthesisTypes = await ctx.db.prosthesisType.findMany({
				where: {
					id: {
						in: input.prosthesisTypeIds,
					},
					isDeleted: false,
				},
			});

			for (const type of allProsthesisTypes) {
				if (!priceMap[type.id]) {
					priceMap[type.id] = type.defaultPrice || 0;
				}
			}

			return priceMap;
		}),

	updateStage: adminProcedure.input(updateStageSchema).mutation(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findUnique({
			where: {
				id: input.dentalWorkId,
				isDeleted: false,
			},
			include: {
				patient: true,
				prosthesisType: true,
			},
		});

		if (!dentalWork) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş çalışması bulunamadı",
			});
		}

		await ctx.db.dentalWork.update({
			where: { id: input.dentalWorkId },
			data: {
				prosthesisStageId: input.prosthesisStageId,
			},
		});

		await ctx.db.stageHistory.create({
			data: {
				dentalWorkId: input.dentalWorkId,
				prosthesisStageId: input.prosthesisStageId,
				...(input.notes ? { notes: input.notes } : {}),
				...(input.attachments ? { attachments: input.attachments } : {}),
			},
		});

		return true;
	}),

	update: adminProcedure.input(updateDentalWorkSchema).mutation(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findUnique({
			where: {
				id: input.dentalWorkId,
				isDeleted: false,
			},
		});

		if (!dentalWork) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş çalışması bulunamadı",
			});
		}

		const updatedDentalWork = await ctx.db.dentalWork.update({
			where: { id: input.dentalWorkId },
			data: {
				...(input.prosthesisStageId ? { prosthesisStageId: input.prosthesisStageId } : {}),
				...(input.toothColorId ? { toothColorId: input.toothColorId } : {}),
				...(input.jawType ? { jawType: input.jawType } : {}),
				...(input.notes !== undefined ? { notes: input.notes } : {}),
				...(input.deliveryDate ? { deliveryDate: input.deliveryDate } : {}),
				...(input.selectedTeeth ? { selectedTeeth: input.selectedTeeth } : {}),
				...(input.selectedJaws ? { selectedJaws: input.selectedJaws } : {}),
			},
		});

		return updatedDentalWork;
	}),

	deleteStageHistory: adminProcedure.input(deleteStageHistorySchema).mutation(async ({ ctx, input }) => {
		const stageHistory = await ctx.db.stageHistory.findUnique({
			where: {
				id: input.stageHistoryId,
			},
		});

		if (!stageHistory) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Aşama geçmişi bulunamadı",
			});
		}

		// Teslim tarihi değişikliği kayıtları gerçek bir aşama olmadığı için "en son aşama" sayılmaz
		const latestEntry = await ctx.db.stageHistory.findFirst({
			where: { dentalWorkId: stageHistory.dentalWorkId, notes: { not: { startsWith: DELIVERY_DATE_NOTE_PREFIX } } },
			orderBy: { createdAt: "desc" },
		});

		if (!latestEntry || latestEntry.id !== stageHistory.id) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Sadece en son eklenen aşama silinebilir",
			});
		}

		await ctx.db.stageHistory.delete({
			where: { id: input.stageHistoryId },
		});

		const previousEntry = await ctx.db.stageHistory.findFirst({
			where: { dentalWorkId: stageHistory.dentalWorkId, notes: { not: { startsWith: DELIVERY_DATE_NOTE_PREFIX } } },
			orderBy: { createdAt: "desc" },
		});

		await ctx.db.dentalWork.update({
			where: { id: stageHistory.dentalWorkId },
			data: {
				prosthesisStageId: previousEntry?.prosthesisStageId ?? null,
			},
		});

		return true;
	}),
});
