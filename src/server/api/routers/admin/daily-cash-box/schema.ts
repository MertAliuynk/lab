import { z } from "zod";

export const getDailyCashBoxSchema = z.object({
	date: z.date(),
});

export const createIncomeSchema = z.object({
	amount: z.number().positive("Miktar pozitif olmalıdır"),
	description: z.string().optional(),
	clinicId: z.string(),
	dentistId: z.string().optional(),
	date: z.date(),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]).default("CASH"),
	confirmExcessPayment: z.boolean().optional(),
});

export const checkDebtSchema = z.object({
	clinicId: z.string(),
	dentistId: z.string(),
	amount: z.number().positive(),
});

export const createExpenseSchema = z.object({
	amount: z.number().positive("Miktar pozitif olmalıdır"),
	description: z.string().optional(),
	date: z.date(),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]).default("CASH"),
	expenseTypeId: z.string().min(1, "Gider türü gereklidir"),
});

export const updateIncomeSchema = z.object({
	id: z.string(),
	amount: z.number().positive("Miktar pozitif olmalıdır").optional(),
	description: z.string().optional(),
	clinicId: z.string().optional(),
	dentistId: z.string().optional(),
	date: z.date().optional(),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]).optional(),
});

export const updateExpenseSchema = z.object({
	id: z.string(),
	amount: z.number().positive("Miktar pozitif olmalıdır").optional(),
	description: z.string().min(1, "Açıklama gereklidir").optional(),
	date: z.date().optional(),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]).optional(),
	expenseTypeId: z.string().optional(),
});

export const deleteIncomeSchema = z.object({
	id: z.string(),
});

export const deleteExpenseSchema = z.object({
	id: z.string(),
});

export const getCashBoxSummarySchema = z.object({
	endDate: z.date(),
});

export const getClinicsSchema = z.object({});
