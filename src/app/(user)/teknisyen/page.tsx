"use client";

import DashboardHeader from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Activity, ArrowRight, Calendar, CheckCircle2, Clock, Sparkles, Stethoscope, Users } from "lucide-react";
import Link from "next/link";

export default function page() {
	const { data: patients = [] } = api.laboratoryTechnician.patient.getAll.useQuery({});
	const { data: allDentalWorks = [] } = api.laboratoryTechnician.dentalWork.getAll.useQuery({});

	const totalPatients = patients.length;
	const totalDentalWorks = allDentalWorks.length;
	const completedWorks = allDentalWorks.filter((work) => work.isCompleted).length;
	const pendingWorks = totalDentalWorks - completedWorks;

	const recentPatients = patients.slice(0, 5);

	return (
		<div className="space-y-6">
			<DashboardHeader title="Teknisyen Dashboard" />

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-2xl font-bold text-gray-800 mb-2">Hoş Geldiniz</h2>
						<p className="text-gray-600">Laboratuvar teknisyeni olarak hasta bilgilerini görüntüleyebilirsiniz</p>
						<div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mt-4" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Users className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-emerald-700 mb-1">{totalPatients}</div>
								<div className="text-sm text-emerald-600 font-medium">Toplam Hasta</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-teal-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Activity className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-teal-700 mb-1">{totalDentalWorks}</div>
								<div className="text-sm text-teal-600 font-medium">Toplam İş</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Clock className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-orange-700 mb-1">{pendingWorks}</div>
								<div className="text-sm text-orange-600 font-medium">Bekleyen İş</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<CheckCircle2 className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-green-700 mb-1">{completedWorks}</div>
								<div className="text-sm text-green-600 font-medium">Tamamlanan</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Son Hastalar</span>
							<Link href="/teknisyen/hastalarim">
								<Badge variant="outline" className="cursor-pointer hover:bg-emerald-50">
									Tümünü Gör <ArrowRight className="w-3 h-3 ml-1" />
								</Badge>
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{recentPatients.length === 0 ? (
							<div className="text-center py-8">
								<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">Henüz hasta bulunmuyor</p>
							</div>
						) : (
							<div className="space-y-4">
								{recentPatients.map((patient) => {
									const totalTeeth =
										patient.dentalWorks?.reduce((sum, work) => sum + (work.selectedTeeth?.length || 0), 0) || 0;
									const pendingDentalWorks = patient.dentalWorks?.filter((work) => !work.isCompleted).length || 0;

									return (
										<div
											key={patient.id}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div className="flex items-center space-x-3">
												<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
													<span className="text-white font-bold text-sm">
														{patient.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)}
													</span>
												</div>
												<div>
													<p className="font-medium">{patient.name}</p>
													<p className="text-sm text-muted-foreground">{patient.dentist?.user?.name}</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<div className="text-right">
													<p className="text-sm font-medium">{totalTeeth} diş</p>
													{pendingDentalWorks > 0 ? (
														<p className="text-xs text-orange-600">{pendingDentalWorks} bekliyor</p>
													) : (
														<p className="text-xs text-green-600">tamamlandı</p>
													)}
												</div>
												<Link href={`/teknisyen/hastalarim/${patient.id}`}>
													<ArrowRight className="w-4 h-4 text-muted-foreground hover:text-emerald-600 transition-colors" />
												</Link>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Hızlı Erişim</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<Link href="/teknisyen/hastalarim">
								<div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
											<Stethoscope className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="font-medium text-emerald-800">Hastalarım</p>
											<p className="text-sm text-emerald-600">Hasta listesi ve detayları</p>
										</div>
									</div>
									<ArrowRight className="w-5 h-5 text-emerald-600" />
								</div>
							</Link>

							<div className="p-4 bg-blue-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
										<Sparkles className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="font-medium text-blue-800">Laboratuvar Teknisyeni</p>
										<p className="text-sm text-blue-600">Sadece görüntüleme yetkisi</p>
									</div>
								</div>
							</div>

							<div className="p-4 bg-amber-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
										<Calendar className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="font-medium text-amber-800">Güncel Tarih</p>
										<p className="text-sm text-amber-600">{new Date().toLocaleDateString("tr-TR")}</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
