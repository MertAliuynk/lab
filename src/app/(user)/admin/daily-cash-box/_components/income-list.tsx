"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit, Plus, Trash2, TrendingUp } from "lucide-react";

interface Income {
	id: string;
	amount: number;
	description?: string | null;
	clinicId: string;
	dentistId?: string | null;
	paymentType: string;
	date: Date;
	dentist?: {
		user: { name: string };
		clinic: { name: string };
	} | null;
	clinic: { name: string };
	createdBy: { name: string };
}

interface IncomeListProps {
	incomes: Income[];
	incomeCount: number;
	onAddIncome: () => void;
	onEditIncome: (income: Income) => void;
	onDeleteIncome: (id: string) => void;
}

export default function IncomeList({
	incomes,
	incomeCount,
	onAddIncome,
	onEditIncome,
	onDeleteIncome,
}: IncomeListProps) {
	const formatCurrency = (amount: number) => {
		return `₺${amount.toLocaleString("tr-TR")}`;
	};

	const getPaymentTypeText = (type: string) => {
		const types = {
			CASH: "Nakit",
			CREDIT_CARD: "Kredi Kartı",
			BANK_TRANSFER: "Havale",
		};
		return types[type as keyof typeof types] || type;
	};

	const handleEditClick = (income: Income) => {
		onEditIncome({
			id: income.id,
			amount: Number(income.amount),
			description: income.description,
			clinicId: income.clinicId,
			dentistId: income.dentistId,
			paymentType: income.paymentType,
			date: income.date,
			dentist: income.dentist,
			clinic: income.clinic,
			createdBy: income.createdBy,
		});
	};

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center text-green-700">
						<TrendingUp className="w-5 h-5 mr-2" />
						Gelirler ({incomeCount})
					</CardTitle>
					<Button onClick={onAddIncome} size="sm" className="bg-green-600 hover:bg-green-700">
						<Plus className="w-4 h-4 mr-2" />
						Gelir Ekle
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{incomes.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
						<p>Bu tarihte gelir kaydı bulunmuyor</p>
					</div>
				) : (
					<div className="space-y-3">
						{incomes.map((income) => (
							<div
								key={income.id}
								className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
							>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1">
										<p className="font-semibold text-green-800">{formatCurrency(Number(income.amount))}</p>
										<Badge variant="outline" className="text-xs">
											{getPaymentTypeText(income.paymentType)}
										</Badge>
									</div>
									{income.description && <p className="text-sm text-green-600 mb-1">{income.description}</p>}
									{income.dentist && (
										<p className="text-xs text-green-600 mb-1 font-medium">
											👨‍⚕️ {income.dentist.user.name} ({income.dentist.clinic.name})
										</p>
									)}
									<p className="text-xs text-green-500">
										{format(new Date(income.date), "HH:mm")} - {income.clinic.name}
									</p>
								</div>
								<div className="flex items-center gap-1 ml-3">
									<Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditClick(income)}>
										<Edit className="w-3 h-3" />
									</Button>
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 text-red-600"
										onClick={() => onDeleteIncome(income.id)}
									>
										<Trash2 className="w-3 h-3" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
