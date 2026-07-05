"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calculator, X } from "lucide-react";

interface CashBoxSummaryModalProps {
	isOpen: boolean;
	onClose: () => void;
	endDate: Date;
}

export default function CashBoxSummaryModal({ isOpen, onClose, endDate }: CashBoxSummaryModalProps) {
	const { data: summary, isLoading } = api.admin.dailyCashBox.getCashBoxSummary.useQuery(
		{ endDate },
		{ enabled: isOpen }
	);

	const formatCurrency = (amount: number) => {
		return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	const formatDate = (date: Date) => {
		return format(date, "d MMMM yyyy", { locale: tr });
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-blue-600" />
						Kasa Detayı
					</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{formatDate(endDate)} tarihi dahil olmak üzere
					</p>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : summary ? (
					<div className="space-y-4 py-2">
						{/* Nakit */}
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600 font-medium">Nakit:</span>
							<span className="text-lg font-semibold">
								₺{summary.summary.cash.toLocaleString('tr-TR')}
							</span>
						</div>

						{/* Havale/EFT */}
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600 font-medium">Havale/EFT:</span>
							<span className="text-lg font-semibold">
								₺{summary.summary.bankTransfer.toLocaleString('tr-TR')}
							</span>
						</div>

						{/* Kredi Kartı */}
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600 font-medium">Kredi Kartı:</span>
							<span className="text-lg font-semibold">
								₺{summary.summary.creditCard.toLocaleString('tr-TR')}
							</span>
						</div>

						{/* Toplam */}
						<div className="flex justify-between items-center py-4 mt-4 border-t border-gray-200">
							<span className="text-gray-900 font-bold text-lg">Toplam:</span>
							<div className="bg-black text-white px-4 py-2 rounded-md">
								<span className="text-lg font-bold">
									₺{summary.summary.total.toLocaleString('tr-TR')}
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						Veri yüklenemedi
					</div>
				)}

				<div className="flex justify-end pt-4 border-t">
					<Button variant="outline" onClick={onClose}>
						<X className="h-4 w-4 mr-2" />
						Kapat
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}