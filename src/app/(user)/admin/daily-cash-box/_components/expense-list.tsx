"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit, Minus, Trash2, TrendingDown } from "lucide-react";

interface Expense {
	id: string;
	amount: number;
	description: string;
	paymentType: string;
	date: Date;
	createdBy: { name: string };
}

interface ExpenseListProps {
	expenses: Expense[];
	expenseCount: number;
	onAddExpense: () => void;
	onEditExpense: (expense: Expense) => void;
	onDeleteExpense: (id: string) => void;
}

export default function ExpenseList({
	expenses,
	expenseCount,
	onAddExpense,
	onEditExpense,
	onDeleteExpense,
}: ExpenseListProps) {
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

	const handleEditClick = (expense: Expense) => {
		onEditExpense({
			id: expense.id,
			amount: Number(expense.amount),
			description: expense.description,
			paymentType: expense.paymentType,
			date: expense.date,
			createdBy: expense.createdBy,
		});
	};

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center text-red-700">
						<TrendingDown className="w-5 h-5 mr-2" />
						Giderler ({expenseCount})
					</CardTitle>
					<Button onClick={onAddExpense} size="sm" variant="destructive">
						<Minus className="w-4 h-4 mr-2" />
						Gider Ekle
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{expenses.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
						<p>Bu tarihte gider kaydı bulunmuyor</p>
					</div>
				) : (
					<div className="space-y-3">
						{expenses.map((expense) => (
							<div
								key={expense.id}
								className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
							>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1">
										<p className="font-semibold text-red-800">{formatCurrency(Number(expense.amount))}</p>
										<Badge variant="outline" className="text-xs">
											{getPaymentTypeText(expense.paymentType)}
										</Badge>
									</div>
									<p className="text-sm text-red-600 mb-1">{expense.description}</p>
									<p className="text-xs text-red-500">
										{format(new Date(expense.date), "HH:mm")} - {expense.createdBy.name}
									</p>
								</div>
								<div className="flex items-center gap-1 ml-3">
									<Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditClick(expense)}>
										<Edit className="w-3 h-3" />
									</Button>
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 text-red-600"
										onClick={() => onDeleteExpense(expense.id)}
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
