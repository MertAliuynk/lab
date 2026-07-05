import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
	createExpenseSchema,
	createIncomeSchema,
	deleteExpenseSchema,
	deleteIncomeSchema,
	getCashBoxSummarySchema,
	getClinicsSchema,
	getDailyCashBoxSchema,
	updateExpenseSchema,
	updateIncomeSchema,
	checkDebtSchema,
} from "./schema";

export const dailyCashBoxRouter = createTRPCRouter({
	getDailyData: adminProcedure.input(getDailyCashBoxSchema).query(async ({ ctx, input }) => {
		const startOfDay = new Date(input.date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(input.date);
		endOfDay.setHours(23, 59, 59, 999);

		// Gelirler
		const incomes = await ctx.db.income.findMany({
			where: {
				date: {
					gte: startOfDay,
					lte: endOfDay,
				},
				isDeleted: false,
			},
			include: {
				createdBy: {
					select: {
						name: true,
					},
				},
				clinic: {
					select: {
						name: true,
					},
				},
				dentist: {
					select: {
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
			orderBy: {
				createdAt: "desc",
			},
		});

		// Giderler
		const expenses = await ctx.db.expense.findMany({
			where: {
				date: {
					gte: startOfDay,
					lte: endOfDay,
				},
				isDeleted: false,
			},
			include: {
				createdBy: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Toplamlar
		const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
		const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
		const netAmount = totalIncome - totalExpense;

		return {
			incomes,
			expenses,
			summary: {
				totalIncome,
				totalExpense,
				netAmount,
				incomeCount: incomes.length,
				expenseCount: expenses.length,
			},
		};
	}),

	getClinics: adminProcedure.input(getClinicsSchema).query(async ({ ctx }) => {
		const clinics = await ctx.db.clinic.findMany({
			where: {
				isDeleted: false,
			},
			select: {
				id: true,
				name: true,
				address: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return clinics;
	}),

	checkDebt: adminProcedure.input(checkDebtSchema).query(async ({ ctx, input }) => {
		const dentist = await ctx.db.dentist.findUnique({
			where: { id: input.dentistId },
			include: {
				user: true,
				clinic: true,
			},
		});

		if (!dentist) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Hekim bulunamadı",
			});
		}

		   // Doktorun toplam borcu (dental work ve ek tedavilerden)
		   const dentistWithWorks = await ctx.db.dentist.findUnique({
			   where: { id: input.dentistId },
			   include: {
				   dentalWorks: {
					   where: {
						   isDeleted: false,
						   patient: { isCompleted: true },
					   },
					   select: {
						   totalPrice: true,
						   unitPrice: true,
						   dentalWorkAdditionalTreatments: {
							   select: { price: true },
						   },
					   },
				   },
			   },
		   });
		   let totalDebt = 0;
		   if (dentistWithWorks) {
			   totalDebt = dentistWithWorks.dentalWorks.reduce((sum, work) => {
				   let workTotal = Number(work.totalPrice || work.unitPrice || 0);
				   if (work.dentalWorkAdditionalTreatments?.length) {
					   workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
						   const price = Number(add.price) || 0;
						   return addSum + price;
					   }, 0);
				   }
				   return sum + workTotal;
			   }, 0);
		   }

		// Mevcut gelirler toplamını hesapla
		const existingIncomes = await ctx.db.income.findMany({
			where: {
				dentistId: input.dentistId,
				isDeleted: false,
			},
		});

		const totalIncomes = existingIncomes.reduce((sum: number, income) => sum + Number(income.amount), 0);

		const remainingDebt = totalDebt - totalIncomes;
		const needsConfirmation = remainingDebt <= 0 || input.amount > remainingDebt;
		const excessAmount = needsConfirmation ? input.amount - Math.max(0, remainingDebt) : 0;
		
		return {
			dentistName: dentist.user.name,
			totalDebt,
			totalIncomes,
			remainingDebt,
			paymentAmount: input.amount,
			needsConfirmation,
			excessAmount,
		};
	}),

	createIncome: adminProcedure.input(createIncomeSchema).mutation(async ({ ctx, input }) => {
		// Doktor seçilmişse ve fazla ödeme onayı istenmemişse borç kontrolü yap
		if (input.dentistId && !input.confirmExcessPayment) {
			const dentist = await ctx.db.dentist.findUnique({
				where: { id: input.dentistId },
				include: {
					user: true,
					clinic: true,
				},
			});

			if (!dentist) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Hekim bulunamadı",
				});
			}

			   // Doktorun toplam borcu (dental work ve ek tedavilerden)
			   const dentistWithWorks = await ctx.db.dentist.findUnique({
				   where: { id: input.dentistId },
				   include: {
					   dentalWorks: {
						   where: {
							   isDeleted: false,
							   patient: { isCompleted: true },
						   },
						   select: {
							   totalPrice: true,
							   unitPrice: true,
							   dentalWorkAdditionalTreatments: {
								   select: { price: true },
							   },
						   },
					   },
				   },
			   });
			   let totalDebt = 0;
			   if (dentistWithWorks) {
				   totalDebt = dentistWithWorks.dentalWorks.reduce((sum, work) => {
					   let workTotal = Number(work.totalPrice || work.unitPrice || 0);
					   if (work.dentalWorkAdditionalTreatments?.length) {
						   workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
							   const price = Number(add.price) || 0;
							   return addSum + price;
						   }, 0);
					   }
					   return sum + workTotal;
				   }, 0);
			   }

			// Mevcut gelirler toplamını hesapla
			const existingIncomes = await ctx.db.income.findMany({
				where: {
					dentistId: input.dentistId,
					isDeleted: false,
				},
			});

			const totalIncomes = existingIncomes.reduce((sum: number, income) => sum + Number(income.amount), 0);

			const remainingDebt = totalDebt - totalIncomes;
			
			// Eğer doktor zaten alacaklı veya ödeme borctan fazlaysa uyarı dön
			if (remainingDebt <= 0 || input.amount > remainingDebt) {
				const statusText = remainingDebt <= 0 
					? `Bu doktor zaten ${Math.abs(remainingDebt).toLocaleString('tr-TR')} ₺ alacaklı.` 
					: `Bu ödeme doktorun kalan borcundan (${remainingDebt.toLocaleString('tr-TR')} ₺) fazla.`;
				
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `${statusText} Devam etmek istiyorsanız onaylayın.`,
				});
			}
		}

		const income = await ctx.db.income.create({
			data: {
				amount: input.amount,
				description: input.description,
				date: input.date,
				paymentType: input.paymentType,
				clinicId: input.clinicId,
				dentistId: input.dentistId,
				createdById: ctx.session?.user?.id || "",
			},
		});

		return income;
	}),

	createExpense: adminProcedure.input(createExpenseSchema).mutation(async ({ ctx, input }) => {
		const expense = await ctx.db.expense.create({
			data: {
				amount: input.amount,
				description: input.description,
				date: input.date,
				paymentType: input.paymentType,
				createdById: ctx.session?.user?.id || "",
				expenseTypeId: input.expenseTypeId,
			},
		});

		return expense;
	}),

	updateIncome: adminProcedure.input(updateIncomeSchema).mutation(async ({ ctx, input }) => {
		const { id, ...updateData } = input;

		const existingIncome = await ctx.db.income.findUnique({
			where: { id },
		});

		if (!existingIncome) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gelir kaydı bulunamadı",
			});
		}

		const updatedIncome = await ctx.db.income.update({
			where: { id },
			data: updateData,
		});

		return updatedIncome;
	}),

	updateExpense: adminProcedure.input(updateExpenseSchema).mutation(async ({ ctx, input }) => {
		const { id, ...updateData } = input;

		const existingExpense = await ctx.db.expense.findUnique({
			where: { id },
		});

		if (!existingExpense) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gider kaydı bulunamadı",
			});
		}

		const updatedExpense = await ctx.db.expense.update({
			where: { id },
			data: updateData,
		});

		return updatedExpense;
	}),

	deleteIncome: adminProcedure.input(deleteIncomeSchema).mutation(async ({ ctx, input }) => {
		const existingIncome = await ctx.db.income.findUnique({
			where: { id: input.id },
		});

		if (!existingIncome) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gelir kaydı bulunamadı",
			});
		}

		await ctx.db.income.update({
			where: { id: input.id },
			data: {
				isDeleted: true,
			},
		});

		return true;
	}),

	deleteExpense: adminProcedure.input(deleteExpenseSchema).mutation(async ({ ctx, input }) => {
		const existingExpense = await ctx.db.expense.findUnique({
			where: { id: input.id },
		});

		if (!existingExpense) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gider kaydı bulunamadı",
			});
		}

		await ctx.db.expense.update({
			where: { id: input.id },
			data: {
				isDeleted: true,
			},
		});

		return true;
	}),

	getAllExpenseTypes: adminProcedure.query(async ({ ctx }) => {
		const expenseTypes = await ctx.db.expenseType.findMany({
			where: { isDeleted: false },
			orderBy: { name: "asc" },
		});
		return expenseTypes;
	}),

	getCashBoxSummary: adminProcedure.input(getCashBoxSummarySchema).query(async ({ ctx, input }) => {
		// Seçili tarihi günün sonuna ayarla (23:59:59.999)
		const endOfDay = new Date(input.endDate);
		endOfDay.setHours(23, 59, 59, 999);

		// Seçili tarihe kadar olan tüm gelirler
		const incomes = await ctx.db.income.findMany({
			where: {
				date: {
					lte: endOfDay,
				},
				isDeleted: false,
			},
		});

		// Seçili tarihe kadar olan tüm giderler  
		const expenses = await ctx.db.expense.findMany({
			where: {
				date: {
					lte: endOfDay,
				},
				isDeleted: false,
			},
		});

		// Ödeme tiplerine göre gelirler
		const incomesByType = {
			CASH: incomes.filter(income => income.paymentType === 'CASH').reduce((sum, income) => sum + Number(income.amount), 0),
			CREDIT_CARD: incomes.filter(income => income.paymentType === 'CREDIT_CARD').reduce((sum, income) => sum + Number(income.amount), 0),
			BANK_TRANSFER: incomes.filter(income => income.paymentType === 'BANK_TRANSFER').reduce((sum, income) => sum + Number(income.amount), 0),
		};

		// Ödeme tiplerine göre giderler
		const expensesByType = {
			CASH: expenses.filter(expense => expense.paymentType === 'CASH').reduce((sum, expense) => sum + Number(expense.amount), 0),
			CREDIT_CARD: expenses.filter(expense => expense.paymentType === 'CREDIT_CARD').reduce((sum, expense) => sum + Number(expense.amount), 0),
			BANK_TRANSFER: expenses.filter(expense => expense.paymentType === 'BANK_TRANSFER').reduce((sum, expense) => sum + Number(expense.amount), 0),
		};

		// Net toplamlar
		const netCash = incomesByType.CASH - expensesByType.CASH;
		const netCreditCard = incomesByType.CREDIT_CARD - expensesByType.CREDIT_CARD;
		const netBankTransfer = incomesByType.BANK_TRANSFER - expensesByType.BANK_TRANSFER;
		const totalNet = netCash + netCreditCard + netBankTransfer;

		return {
			summary: {
				cash: netCash,
				creditCard: netCreditCard,
				bankTransfer: netBankTransfer,
				total: totalNet,
			},
			details: {
				incomes: incomesByType,
				expenses: expensesByType,
			},
		};
	}),
});
