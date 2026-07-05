import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";
import { getPaymentsSchema } from "./schema";

export const paymentRouter = createTRPCRouter({
	getAll: dentistProcedure.input(getPaymentsSchema).query(async ({ ctx, input }) => {
		const { page, perPage, startDate, endDate } = input;

		const where = {
			dentistId: ctx.dentist!.id,
			isDeleted: false,
			...(startDate &&
				endDate && {
					date: {
						gte: startDate,
						lte: endDate,
					},
				}),
		};

		const incomes = await ctx.db.income.findMany({
			where,
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
						clinic: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			orderBy: { date: "desc" },
			take: perPage,
			skip: (page - 1) * perPage,
		});

		const totalCount = await ctx.db.income.count({ where });
		const totalPages = Math.ceil(totalCount / perPage);

		return {
			payments: incomes,
			pagination: {
				page,
				perPage,
				totalCount,
				totalPages,
			},
		};
	}),

	getSummary: dentistProcedure.query(async ({ ctx }) => {
		// Toplam alınan ödemeler (Income kayıtları)
		const totalIncomes = await ctx.db.income.findMany({
			where: {
				dentistId: ctx.dentist!.id,
				isDeleted: false,
			},
		});

		// Hekimin sadece tamamlanan hastaların dental work'leri (borç kaynağı)
		const allDentalWorks = await ctx.db.dentalWork.findMany({
			where: {
				dentistId: ctx.dentist!.id,
				isDeleted: false,
				patient: {
					isCompleted: true, // Sadece bitim yapılan hastalar
				},
			},
			include: {
				patient: {
					select: {
						isCompleted: true,
						completedAt: true,
					},
				},
				dentalWorkAdditionalTreatments: true,
			},
		});

		// Hesaplamalar
		const totalReceived = totalIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
		const totalDebt = allDentalWorks.reduce((sum, work) => {
			let workTotal = Number(work.totalPrice || work.unitPrice || 0);
			if (work.dentalWorkAdditionalTreatments?.length) {
				workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
					const price = Number(add.price) || 0;
					const quantity = add.quantity || 1;
					return addSum + price * quantity;
				}, 0);
			}
			return sum + workTotal;
		}, 0);
		const remainingDebt = Math.max(0, totalDebt - totalReceived);

		return {
			summary: {
				totalReceived,
				remainingDebt,
				paymentRate: totalDebt > 0 ? Math.round((totalReceived / totalDebt) * 100) : 0,
			},
		};
	}),

	getAllPayments: dentistProcedure.query(async ({ ctx }) => {
		const incomes = await ctx.db.income.findMany({
			where: {
				dentistId: ctx.dentist!.id,
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
						clinic: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			orderBy: { date: "desc" },
		});

		return incomes;
	}),
});
