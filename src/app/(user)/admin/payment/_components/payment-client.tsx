"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSummary {
	id: string;
	name: string;
	dentistCount: number;
	totalDebt: number;
	totalReceived: number;
	remainingDebt: number;
	paymentRate: number;
}

interface TotalStats {
	totalDebt: number;
	totalReceived: number;
	remainingDebt: number;
}

interface Props {
	paymentSummary: PaymentSummary[];
	totalStats: TotalStats;
}

export default function PaymentClient({ paymentSummary, totalStats }: Props) {
	const router = useRouter();

	const handleViewDetails = (clinicId: string) => {
		router.push(`/admin/payment/${clinicId}`);
	};

	return (
		<div className="p-6 space-y-8">
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-lg font-semibold text-gray-700 mb-2">Klinik Ödemeleri</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-blue-700 mb-1">{paymentSummary?.length || 0}</div>
								<div className="text-sm text-blue-600 font-medium">Toplam Klinik</div>
								<div className="w-full h-1 bg-blue-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-emerald-700 mb-1">
									{formatCurrency(totalStats?.totalReceived || 0)}
								</div>
								<div className="text-sm text-emerald-600 font-medium">Alınan Toplam</div>
								<div className="w-full h-1 bg-emerald-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="text-3xl font-bold text-orange-700 mb-1">
									{formatCurrency(totalStats?.totalDebt || 0)}
								</div>
								<div className="text-sm text-orange-600 font-medium">Toplam Borç</div>
								<div className="w-full h-1 bg-orange-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className={`absolute -inset-4 bg-gradient-to-r ${
								(totalStats?.remainingDebt || 0) > 0 
									? 'from-red-400 to-red-600' 
									: 'from-green-400 to-green-600'
							} rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl`} />
							<div className={`relative bg-white/70 backdrop-blur-sm border ${
								(totalStats?.remainingDebt || 0) > 0 
									? 'border-red-200/50' 
									: 'border-green-200/50'
							} rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
								<div className={`text-3xl font-bold ${
									(totalStats?.remainingDebt || 0) > 0 
										? 'text-red-700' 
										: 'text-green-700'
								} mb-1`}>
									{formatCurrency(Math.abs(totalStats?.remainingDebt || 0))}
								</div>
								<div className={`text-sm ${
									(totalStats?.remainingDebt || 0) > 0 
										? 'text-red-600' 
										: 'text-green-600'
								} font-medium`}>
									{(totalStats?.remainingDebt || 0) > 0 
										? 'Kalan Borç' 
										: (totalStats?.remainingDebt || 0) < 0 
											? 'Toplam Alacak' 
											: 'Borçsuz'
									}
								</div>
								<div className={`w-full h-1 ${
									(totalStats?.remainingDebt || 0) > 0 
										? 'bg-red-200' 
										: 'bg-green-200'
								} rounded-full mt-3`}>
									<div className={`h-1 bg-gradient-to-r ${
										(totalStats?.remainingDebt || 0) > 0 
											? 'from-red-400 to-red-600' 
											: 'from-green-400 to-green-600'
									} rounded-full w-full`} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Klinik Listesi</h2>

				{paymentSummary?.map((clinic) => (
					<Card key={clinic.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
									<p className="text-sm text-gray-600">{clinic.dentistCount} Hekim</p>
								</div>

								<div className="flex-1 mx-8 space-y-3">
									<div className="flex justify-between text-sm">
										<span>Ödeme Durumu: {clinic.paymentRate}%</span>
										<span className="font-medium">
											{clinic.remainingDebt > 0 
												? `Kalan Borç: ${formatCurrency(clinic.remainingDebt)}`
												: clinic.remainingDebt < 0
													? `${formatCurrency(Math.abs(clinic.remainingDebt))} Alacaklı`
													: 'Borçsuz'
											}
										</span>
									</div>
									<Progress value={clinic.paymentRate} className="h-2" />
								</div>

								<div className="text-right space-y-1 mr-4">
									<div className="text-sm text-gray-600">
										{clinic.remainingDebt > 0 
											? 'Kalan Borç' 
											: clinic.remainingDebt < 0 
												? 'Alacaklı' 
												: 'Durum'
										}
									</div>
									<Badge
										variant={
											clinic.remainingDebt > 0 
												? "destructive" 
												: clinic.remainingDebt < 0 
													? "default" 
													: "secondary"
										}
										className={`text-sm font-semibold ${
											clinic.remainingDebt < 0 ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
										}`}
									>
										{clinic.remainingDebt > 0 
											? formatCurrency(clinic.remainingDebt)
											: clinic.remainingDebt < 0 
												? `${formatCurrency(Math.abs(clinic.remainingDebt))} ₺`
												: '0 ₺'
										}
									</Badge>
								</div>

								<Button
									onClick={() => handleViewDetails(clinic.id)}
									variant="outline"
									size="sm"
									className="hover:bg-blue-50 hover:border-blue-300"
								>
									Detaylar
									<ArrowRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}

				{paymentSummary?.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center">
							<div className="text-gray-500">
								<Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium">Henüz klinik bulunmuyor</p>
								<p className="text-sm">Sistem veri eklendikçe bu sayfa güncellenecektir.</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
