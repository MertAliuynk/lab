"use client";

import { cn } from "@/lib/utils";

interface DailySummary {
	totalIncome: number;
	totalExpense: number;
	netAmount: number;
	incomeCount: number;
	expenseCount: number;
}

interface DailySummaryProps {
	summary: DailySummary;
}

export default function DailySummary({ summary }: DailySummaryProps) {
	const formatCurrency = (amount: number) => {
		return `₺${amount.toLocaleString("tr-TR")}`;
	};

	return (
		<div className="relative mb-8 overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-3xl" />
			<div className="relative p-8">
				<div className="text-center mb-6">
					<h2 className="text-lg font-semibold text-gray-700 mb-2">Günlük Kasa</h2>
					<div className="w-20 h-1 bg-gradient-to-r from-green-500 to-purple-500 rounded-full mx-auto" />
				</div>

				<div className="flex flex-col md:flex-row items-center justify-center gap-8">
					<div className="group relative">
						<div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
						<div className="relative bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
							<div className="text-3xl font-bold text-green-700 mb-1">{formatCurrency(summary.totalIncome)}</div>
							<div className="text-sm text-green-600 font-medium">Toplam Gelir</div>
							<div className="text-xs text-green-600 mt-1">{summary.incomeCount} kayıt</div>
							<div className="w-full h-1 bg-green-200 rounded-full mt-3">
								<div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full w-full" />
							</div>
						</div>
					</div>

					<div className="hidden md:block w-12 h-12 relative">
						<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
						<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-green-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
					</div>

					<div className="group relative">
						<div className="absolute -inset-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
						<div className="relative bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
							<div className="text-3xl font-bold text-red-700 mb-1">{formatCurrency(summary.totalExpense)}</div>
							<div className="text-sm text-red-600 font-medium">Toplam Gider</div>
							<div className="text-xs text-red-600 mt-1">{summary.expenseCount} kayıt</div>
							<div className="w-full h-1 bg-red-200 rounded-full mt-3">
								<div className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full w-full" />
							</div>
						</div>
					</div>

					<div className="hidden md:block w-12 h-12 relative">
						<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
						<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-red-400 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
					</div>

					<div className="group relative">
						<div
							className={cn(
								"absolute -inset-4 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl",
								summary.netAmount >= 0
									? "bg-gradient-to-r from-blue-400 to-blue-600"
									: "bg-gradient-to-r from-orange-400 to-orange-600",
							)}
						/>
						<div
							className={cn(
								"relative bg-white/70 backdrop-blur-sm border rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
								summary.netAmount >= 0 ? "border-blue-200/50" : "border-orange-200/50",
							)}
						>
							<div
								className={cn("text-3xl font-bold mb-1", summary.netAmount >= 0 ? "text-blue-700" : "text-orange-700")}
							>
								{formatCurrency(summary.netAmount)}
							</div>
							<div className={cn("text-sm font-medium", summary.netAmount >= 0 ? "text-blue-600" : "text-orange-600")}>
								Net Durum
							</div>
							<div className={cn("text-xs mt-1", summary.netAmount >= 0 ? "text-blue-600" : "text-orange-600")}>
								{summary.netAmount >= 0 ? "Kâr" : "Zarar"}
							</div>
							<div
								className={cn("w-full h-1 rounded-full mt-3", summary.netAmount >= 0 ? "bg-blue-200" : "bg-orange-200")}
							>
								<div
									className={cn(
										"h-1 rounded-full w-full",
										summary.netAmount >= 0
											? "bg-gradient-to-r from-blue-400 to-blue-600"
											: "bg-gradient-to-r from-orange-400 to-orange-600",
									)}
								/>
							</div>
						</div>
					</div>

					<div className="hidden md:block w-12 h-12 relative">
						<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
						<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
					</div>

					<div className="group relative">
						<div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
						<div className="relative bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
							<div className="text-3xl font-bold text-purple-700 mb-1">
								{summary.incomeCount + summary.expenseCount}
							</div>
							<div className="text-sm text-purple-600 font-medium">Toplam İşlem</div>
							<div className="text-xs text-purple-600 mt-1">
								{summary.incomeCount} gelir + {summary.expenseCount} gider
							</div>
							<div className="w-full h-1 bg-purple-200 rounded-full mt-3">
								<div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-full" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
