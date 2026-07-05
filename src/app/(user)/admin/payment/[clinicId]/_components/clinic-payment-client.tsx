"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Decimal } from "@prisma/client/runtime/library";
import { ArrowLeft, Building2, CreditCard, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DebtTransferModal from "./debt-transfer-modal";

export interface PaymentDetail {
	clinic: {
		name: string;
	};
	summary: {
		totalDebt: number;
		totalReceived: number;
		remainingDebt: number;
		paymentRate: number;
	};
	dentistSummaries: Array<{
		id: string;
		name: string;
		workCount: number;
		totalDebt: number;
		totalReceived: number;
		remainingDebt: number;
		paymentRate: number;
	}>;
	incomes: Array<{
		id: string;
		amount: Decimal;
		createdAt: Date;
		dentist: {
			user: {
				name: string;
			};
		} | null;
	}>;
}

interface Props {
	paymentDetail: PaymentDetail | null;
	clinicId: string;
}

export default function ClinicPaymentClient({ paymentDetail, clinicId }: Props) {
	const router = useRouter();
	const [refreshKey, setRefreshKey] = useState(0);

	const handleGoBack = () => {
		router.push("/admin/payment");
	};

	const handleViewDentistDetails = (dentistId: string) => {
		router.push(`/admin/payment/clinic/${dentistId}`);
	};

	const handleTransferSuccess = () => {
		// Sayfayı yenile - gerçek uygulamada router.refresh() kullanılabilir
		setRefreshKey(prev => prev + 1);
		router.refresh();
	};

	if (!paymentDetail) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Klinik Bulunamadı</h2>
					<p className="text-gray-600 mb-6">Aradığınız klinik mevcut değil veya silinmiş olabilir.</p>
					<Button onClick={handleGoBack} variant="outline">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	const { clinic, summary, dentistSummaries, incomes } = paymentDetail;

	return (
		<div className="p-6 space-y-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={handleGoBack} variant="outline" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Geri
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							{clinic.name}
						</h1>
						<p className="text-gray-600">Klinik Ödeme Detayları</p>
					</div>
				</div>
				<div>
					{dentistSummaries.length > 1 && (
						<DebtTransferModal 
							clinicId={clinicId} 
							dentistSummaries={dentistSummaries}
							onSuccess={handleTransferSuccess}
						/>
					)}
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Klinik Bilgileri
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="flex items-center gap-3">
							<Users className="h-5 w-5 text-gray-400" />
							<div>
								<p className="text-sm text-gray-600">Toplam Hekim</p>
								<p className="font-medium">{dentistSummaries.length}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-gray-400" />
							<div>
								<p className="text-sm text-gray-600">Toplam İş</p>
								<p className="font-medium">{dentistSummaries.reduce((sum, dentist) => sum + dentist.workCount, 0)}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-green-50 to-blue-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-orange-700 mb-1">{formatCurrency(summary.totalDebt)}</div>
								<div className="text-sm text-orange-600 font-medium">Toplam Borç</div>
								<div className="w-full h-1 bg-orange-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-orange-400 to-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-emerald-700 mb-1">{formatCurrency(summary.totalReceived)}</div>
								<div className="text-sm text-emerald-600 font-medium">Alınan Toplam</div>
								<div className="w-full h-1 bg-emerald-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-green-400 to-red-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-red-700 mb-1">{formatCurrency(summary.remainingDebt)}</div>
								<div className="text-sm text-red-600 font-medium">Kalan Borç</div>
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
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-blue-700 mb-1">{summary.paymentRate}%</div>
								<div className="text-sm text-blue-600 font-medium">Ödeme Oranı</div>
								<div className="w-full h-1 bg-blue-200 rounded-full mt-3">
									<div
										className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
										style={{ width: `${summary.paymentRate}%` }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Hekim Özeti ({dentistSummaries.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{dentistSummaries.map((dentist) => (
								<div key={dentist.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div>
										<h4 className="font-medium">{dentist.name}</h4>
										<p className="text-sm text-gray-600">{dentist.workCount} İş</p>
									</div>
									<div className="text-right">
										<p className="font-medium">{formatCurrency(dentist.remainingDebt)}</p>
										<p className="text-sm text-gray-600">Kalan Borç</p>
									</div>
									<Button onClick={() => handleViewDentistDetails(dentist.id)} variant="outline" size="sm">
										Detay
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							Ödemeler ({incomes.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{incomes.map((income) => (
								<div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div>
										<h4 className="font-medium">{income.dentist?.user?.name}</h4>
										<p className="text-sm text-gray-600">{formatDate(income.createdAt)}</p>
									</div>
									<Badge variant="default">{formatCurrency(Number(income.amount))}</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
