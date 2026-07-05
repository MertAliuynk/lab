"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";

import AddExpenseModal from "./_components/add-expense-modal";
import AddIncomeModal from "./_components/add-income-modal";
import CashBoxError from "./_components/cash-box-error";
import CashBoxLoading from "./_components/cash-box-loading";
import CashBoxSummaryModal from "./_components/cash-box-summary-modal";
import DailySummary from "./_components/daily-summary";
import DateSelector from "./_components/date-selector";
import EditExpenseModal from "./_components/edit-expense-modal";
import EditIncomeModal from "./_components/edit-income-modal";
import ExpenseList from "./_components/expense-list";
import IncomeList from "./_components/income-list";

type IncomeData = {
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
};

type ExpenseData = {
	id: string;
	amount: number;
	description: string;
	paymentType: string;
	date: Date;
	createdBy: { name: string };
};

export default function DailyCashBoxPage() {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [showIncomeModal, setShowIncomeModal] = useState(false);
	const [showExpenseModal, setShowExpenseModal] = useState(false);
	const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
	const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showCashBoxSummary, setShowCashBoxSummary] = useState(false);
	const [selectedIncome, setSelectedIncome] = useState<IncomeData | null>(null);
	const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);
	const [deleteType, setDeleteType] = useState<"income" | "expense" | null>(null);
	const [deleteId, setDeleteId] = useState<string>("");

	const {
		data: dailyData,
		isLoading,
		error,
		refetch,
	} = api.admin.dailyCashBox.getDailyData.useQuery({
		date: selectedDate,
	});

	const deleteIncomeMutation = api.admin.dailyCashBox.deleteIncome.useMutation({
		onSuccess: () => {
			toast.success("Gelir başarıyla silindi");
			refetch();
			setShowDeleteDialog(false);
		},
		onError: (error) => {
			toast.error(error.message || "Gelir silinirken hata oluştu");
		},
	});

	const deleteExpenseMutation = api.admin.dailyCashBox.deleteExpense.useMutation({
		onSuccess: () => {
			toast.success("Gider başarıyla silindi");
			refetch();
			setShowDeleteDialog(false);
		},
		onError: (error) => {
			toast.error(error.message || "Gider silinirken hata oluştu");
		},
	});

	const handleEditIncome = (income: IncomeData) => {
		setSelectedIncome(income);
		setShowEditIncomeModal(true);
	};

	const handleEditExpense = (expense: ExpenseData) => {
		setSelectedExpense(expense);
		setShowEditExpenseModal(true);
	};

	const handleDeleteClick = (type: "income" | "expense", id: string) => {
		setDeleteType(type);
		setDeleteId(id);
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (deleteType === "income") {
			deleteIncomeMutation.mutate({ id: deleteId });
		} else if (deleteType === "expense") {
			deleteExpenseMutation.mutate({ id: deleteId });
		}
	};

	const handleRefresh = () => {
		refetch();
	};

	if (isLoading) {
		return <CashBoxLoading />;
	}

	if (error) {
		return <CashBoxError error={error.message} onRetry={handleRefresh} />;
	}

	if (!dailyData) {
		return <CashBoxError error="Veri bulunamadı" onRetry={handleRefresh} />;
	}

	const transformedIncomes = dailyData.incomes.map((income) => ({
		...income,
		amount: Number(income.amount),
	}));

	const transformedExpenses = dailyData.expenses.map((expense) => ({
		...expense,
		amount: Number(expense.amount),
	}));

	return (
		<div className="space-y-6">
			<DateSelector 
				selectedDate={selectedDate} 
				onDateChange={setSelectedDate}
				onCashBoxSummary={() => setShowCashBoxSummary(true)}
			/>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<IncomeList
					incomes={transformedIncomes}
					incomeCount={dailyData.summary.incomeCount}
					onAddIncome={() => setShowIncomeModal(true)}
					onEditIncome={handleEditIncome}
					onDeleteIncome={(id) => handleDeleteClick("income", id)}
				/>

				<ExpenseList
					expenses={transformedExpenses}
					expenseCount={dailyData.summary.expenseCount}
					onAddExpense={() => setShowExpenseModal(true)}
					onEditExpense={handleEditExpense}
					onDeleteExpense={(id) => handleDeleteClick("expense", id)}
				/>
			</div>

			<AddIncomeModal
				isOpen={showIncomeModal}
				onClose={() => setShowIncomeModal(false)}
				selectedDate={selectedDate}
				onSuccess={() => {
					handleRefresh();
					setShowIncomeModal(false);
				}}
			/>

			<AddExpenseModal
				isOpen={showExpenseModal}
				onClose={() => setShowExpenseModal(false)}
				selectedDate={selectedDate}
				onSuccess={() => {
					handleRefresh();
					setShowExpenseModal(false);
				}}
			/>

			<EditIncomeModal
				isOpen={showEditIncomeModal}
				onClose={() => setShowEditIncomeModal(false)}
				income={selectedIncome}
				onSuccess={() => {
					handleRefresh();
					setShowEditIncomeModal(false);
				}}
			/>

			<EditExpenseModal
				isOpen={showEditExpenseModal}
				onClose={() => setShowEditExpenseModal(false)}
				expense={selectedExpense}
				onSuccess={() => {
					handleRefresh();
					setShowEditExpenseModal(false);
				}}
			/>

			<AlertDialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Silme İşlemi</AlertDialogTitle>
						<AlertDialogDescription>Bu işlemi gerçekleştirmek istediğinizden emin misiniz?</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>İptal</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete}>Sil</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<CashBoxSummaryModal
				isOpen={showCashBoxSummary}
				onClose={() => setShowCashBoxSummary(false)}
				endDate={selectedDate}
			/>
		</div>
	);
}
