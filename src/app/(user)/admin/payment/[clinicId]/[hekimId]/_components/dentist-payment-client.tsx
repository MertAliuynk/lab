"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Decimal } from "@prisma/client/runtime/library";
import { ArrowLeft, Building, CreditCard, FileText, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentDetail {
	dentist: {
		name: string;
		clinicName: string;
		email?: string | null;
		phone?: string | null;
	};
	summary: {
		totalDebt: number;
		totalReceived: number;
		remainingDebt: number;
		paymentRate: number;
	};
	dentalWorks: Array<{
		id: string;
		patient: { name: string };
		prosthesisType: { name: string };
		prosthesisStage: { name: string; percentage: number } | null;
		totalPrice: Decimal | null;
		unitPrice: Decimal | null;
		createdAt: Date;
		isCompleted: boolean;
	}>;
	incomes: Array<{
		id: string;
		amount: Decimal;
		createdAt: Date;
	}>;
}

interface Props {
	paymentDetail: PaymentDetail | null;
}

export default function DentistPaymentClient({ paymentDetail }: Props) {
	const router = useRouter();

	const handleGoBack = () => {
		router.push("/admin/payment");
	};

	if (!paymentDetail) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Hekim Bulunamadı</h2>
					<p className="text-gray-600 mb-6">Aradığınız hekim mevcut değil veya silinmiş olabilir.</p>
					<Button onClick={handleGoBack} variant="outline">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	const { dentist, summary, dentalWorks, incomes } = paymentDetail;

	return (
		<div className="p-6 space-y-8">
			<div className="flex items-center gap-4">
				<Button onClick={handleGoBack} variant="outline" size="sm">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Geri
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						{dentist.name}
					</h1>
					<p className="text-gray-600">Ödeme Detayları</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Hekim Bilgileri
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="flex items-center gap-3">
							<Building className="h-5 w-5 text-gray-400" />
							<div>
								<p className="text-sm text-gray-600">Klinik</p>
								<p className="font-medium">{dentist.clinicName}</p>
							</div>
						</div>

						{dentist.email && (
							<div className="flex items-center gap-3">
								<Mail className="h-5 w-5 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">E-posta</p>
									<p className="font-medium">{dentist.email}</p>
								</div>
							</div>
						)}

						{dentist.phone && (
							<div className="flex items-center gap-3">
								<Phone className="h-5 w-5 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">Telefon</p>
									<p className="font-medium">{dentist.phone}</p>
								</div>
							</div>
						)}
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
							<FileText className="h-5 w-5" />
							Diş İşleri ({dentalWorks.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{dentalWorks.slice(0, 10).map((work) => (
								<div key={work.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div>
										<h4 className="font-medium">{work.patient.name}</h4>
										<p className="text-sm text-gray-600">{work.prosthesisType.name}</p>
										<p className="text-xs text-gray-500">{formatDate(work.createdAt)}</p>
									</div>
									<div className="text-right">
										<p className="font-medium">{formatCurrency(Number(work.totalPrice || work.unitPrice || 0))}</p>
										<Badge variant={work.isCompleted ? "default" : "secondary"}>
											{work.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
										</Badge>
									</div>
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
							{incomes.slice(0, 10).map((income) => (
								<div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div>
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
