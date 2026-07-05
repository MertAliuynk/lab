"use client";

import DashboardHeader from "@/components/dashboard-header";

// DentalWork tipini ekle veya güncelle
type DentalWork = {
	id: string;
	isCompleted: boolean;
	prosthesisType: {
		name: string;
		id: string;
		isDeleted: boolean;
		createdAt: Date;
		updatedAt: Date;
		description: string | null;
		defaultPrice: number | null;
		pricingType: string;
	};
	prosthesisStage: any | null;
	selectedTeeth: string[];
	selectedJaws?: string[];
};
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { api } from "@/trpc/react";
import { Activity, ArrowRight, Calendar, CheckCircle2, Search, User, Users, Zap } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export default function page() {
	const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [inputValue, setInputValue] = useState(searchQuery);
	const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("ongoing");
	const [locationFilter, setLocationFilter] = useState<"all" | "at_doctor" | "at_technician">("all");
	const [dentistFilter, setDentistFilter] = useState<string>("all");

	const { data: patients = [], isLoading } = api.laboratoryTechnician.patient.getAll.useQuery({
		name: searchQuery || undefined,
	});

	const { data: allDentalWorks = [] } = api.laboratoryTechnician.dentalWork.getAll.useQuery({});

	// Benzersiz hekimleri al
	const uniqueDentists = Array.from(
		new Map(
			patients
				.filter(patient => patient.dentist?.user?.name)
				.map(patient => [
					patient.dentist.id,
					{
						id: patient.dentist.id,
						name: patient.dentist.user.name,
					}
				])
		).values()
	);

	const debouncedSearch = useDebouncedCallback((value: string) => {
		setSearchQuery(value);
	}, 500);

	const handleSearchChange = (value: string) => {
		setInputValue(value);
		debouncedSearch(value);
	};

	useEffect(() => {
		setInputValue(searchQuery);
	}, [searchQuery]);

	// Filtrelenmiş hastaları hesapla
	const filteredPatients = patients.filter((patient) => {
		// Durum filtresi (devam edenler, tamamlananlar)
		if (statusFilter !== "all") {
			// Hastanın tüm işlemlerinin completion durumunu kontrol et
			const groupedByType =
				patient.dentalWorks?.reduce(
					(acc, work) => {
						const typeName = work.prosthesisType?.name || "Bilinmeyen";
						if (!acc[typeName]) {
							acc[typeName] = { maxPercentage: 0 };
						}

						const currentPercentage = work.prosthesisStage?.percentage || 0;
						if (currentPercentage > acc[typeName].maxPercentage) {
							acc[typeName].maxPercentage = currentPercentage;
						}

						return acc;
					},
					{} as Record<string, { maxPercentage: number }>,
				) || {};

			const prosthesisTypes = Object.values(groupedByType);

			if (prosthesisTypes.length === 0) {
				// İşlemi olmayan hastalar "ongoing"de gösterilecek
				if (statusFilter !== "ongoing") return false;
			} else {
				// Yüzde kontrolü kaldırıldı - sadece manuel bitim kontrolü
				const patientWithCompletion = patient as typeof patient & { isCompleted?: boolean };
				const isFullyCompleted = patientWithCompletion.isCompleted || false;

				if (statusFilter === "completed" && !isFullyCompleted) return false;
				if (statusFilter === "ongoing" && isFullyCompleted) return false;
			}
		}

		// Lokasyon filtresi (doktorda/teknisyende olan)
		if (locationFilter !== "all") {
			const patientWithUpdate = patient as typeof patient & { lastUpdateBy?: 'doctor' | 'technician' | null };

			// En son doktor güncelleme yaptıysa hasta teknisyende
			// En son teknisyen güncelleme yaptıysa hasta doktorda
			if (locationFilter === "at_technician" && patientWithUpdate.lastUpdateBy !== "doctor") {
				return false;
			}
			if (locationFilter === "at_doctor" && patientWithUpdate.lastUpdateBy !== "technician") {
				return false;
			}
		}

		// Hekim filtresi
		if (dentistFilter !== "all") {
			if (patient.dentist?.id !== dentistFilter) {
				return false;
			}
		}

		return true;
	});

	const totalPatients = filteredPatients.length;
	const totalDentalWorks = allDentalWorks.length;
	const completedWorks = allDentalWorks.filter((work) => work.isCompleted).length;
	const pendingWorks = totalDentalWorks - completedWorks;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<DashboardHeader title="Hastalarım" />
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							prefix={<Search className="w-4 h-4 text-muted-foreground" />}
							placeholder="Hasta ara..."
							className="w-full sm:w-64"
							value={inputValue}
							onChange={(e) => handleSearchChange(e.target.value)}
						/>
					</div>
					<div className="flex flex-col sm:flex-row gap-2">
						<Select
							value={statusFilter}
							onValueChange={(value: "all" | "ongoing" | "completed") => setStatusFilter(value)}
						>
							<SelectTrigger className="w-full sm:w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tümü</SelectItem>
								<SelectItem value="ongoing">Devam Edenler</SelectItem>
								<SelectItem value="completed">Tamamlananlar</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={locationFilter}
							onValueChange={(value: "all" | "at_doctor" | "at_technician") => setLocationFilter(value)}
						>
							<SelectTrigger className="w-full sm:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tüm Hastalar</SelectItem>
								<SelectItem value="at_doctor">Doktorda Olan</SelectItem>
								<SelectItem value="at_technician">Teknisyende Olan</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={dentistFilter}
							onValueChange={(value: string) => setDentistFilter(value)}
						>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Hekim seçin" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tüm Hekimler</SelectItem>
								{uniqueDentists.map((dentist) => (
									<SelectItem key={dentist.id} value={dentist.id}>
										Dt. {dentist.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Users className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-emerald-700 mb-1">{totalPatients}</div>
								<div className="text-sm text-emerald-600 font-medium">Hasta</div>
								<div className="w-full h-1 bg-emerald-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-teal-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Activity className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-teal-700 mb-1">{totalDentalWorks}</div>
								<div className="text-sm text-teal-600 font-medium">Toplam İş</div>
								<div className="w-full h-1 bg-teal-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-cyan-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Zap className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-cyan-700 mb-1">{pendingWorks}</div>
								<div className="text-sm text-cyan-600 font-medium">Bekleyen İş</div>
								<div className="w-full h-1 bg-cyan-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full w-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }, (_, i) => (
						<Card key={`patient-loading-${Date.now()}-${i}`} className="animate-pulse">
							<CardHeader className="pb-3">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-gray-300 rounded-full" />
									<div className="space-y-2">
										<div className="h-4 bg-gray-300 rounded w-32" />
										<div className="h-3 bg-gray-300 rounded w-24" />
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="h-3 bg-gray-300 rounded w-full" />
								<div className="h-3 bg-gray-300 rounded w-3/4" />
								<div className="h-3 bg-gray-300 rounded w-1/2" />
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredPatients.length === 0 ? (
				<Card>
					<CardContent className="text-center py-12">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
							<User className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">
							{searchQuery || statusFilter !== "ongoing" || locationFilter !== "all" || dentistFilter !== "all"
								? "Aradığınız kriterlere uygun hasta bulunamadı"
								: "Henüz devam eden hasta bulunmuyor"}
						</h3>
						<p className="text-muted-foreground">
							{searchQuery || statusFilter !== "ongoing" || locationFilter !== "all" || dentistFilter !== "all"
								? "Farklı arama terimleri veya filtreler deneyebilirsiniz."
								: "Devam eden hasta işlemi bulunmuyor."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredPatients.map((patient) => {
						const groupedByType =
							patient.dentalWorks?.reduce(
								(acc, work) => {
									const typeName = work.prosthesisType?.name || "Bilinmeyen";
									const pricingType = work.prosthesisType?.pricingType || "TOOTH_BASED";
									if (!acc[typeName]) {
										acc[typeName] = {
											count: 0,
											teeth: 0,
											jaws: [],
											pricingType,
											maxPercentage: 0,
										};
									}
									acc[typeName].count += 1;
									if (pricingType === "JAW_BASED" && Array.isArray((work as any).selectedJaws)) {
										acc[typeName].jaws.push(...(work as any).selectedJaws);
									} else {
										acc[typeName].teeth += work.selectedTeeth?.length || 0;
									}

									const currentPercentage = work.prosthesisStage?.percentage || 0;
									if (currentPercentage > acc[typeName].maxPercentage) {
										acc[typeName].maxPercentage = currentPercentage;
									}

									return acc;
								},
								{} as Record<string, { count: number; teeth: number; jaws: string[]; pricingType: string; maxPercentage: number }>,
							) || {};

						const prosthesisTypes = Object.entries(groupedByType);

						// Yüzde kontrolü kaldırıldı - sadece manuel bitim kontrolü
						const patientWithCompletion = patient as typeof patient & { isCompleted?: boolean };
						const isFullyCompleted = patientWithCompletion.isCompleted || false;

						// Extract lastUpdateBy for color logic
						const patientWithUpdate = patient as typeof patient & { lastUpdateBy?: 'doctor' | 'technician' | null };
						const lastUpdateBy = patientWithUpdate.lastUpdateBy;

						// --- DOKTORDA/TEKNISYENDE RENK KONTROLÜ ---
						// Son dentalWork'un notes veya prosthesisStage.name alanı ile kontrol
						const kuryeNotes = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI"];
						const bitimNotes = ["BITIM_YAPILDI"];
						let isKurye = false;
						let isBitim = false;
						if (patient.dentalWorks && patient.dentalWorks.length > 0) {
							// Yüzdeye göre değil, en son dentalWork'a göre kontrol
							const worksSorted = [...patient.dentalWorks].sort((a, b) => {
								const aPerc = a.prosthesisStage?.percentage || 0;
								const bPerc = b.prosthesisStage?.percentage || 0;
								return bPerc - aPerc;
							});
							const lastWork = worksSorted[0];
							if (lastWork) {
								if (typeof lastWork.notes === 'string' && kuryeNotes.includes(lastWork.notes)) {
									isKurye = true;
								}
								if (lastWork.prosthesisStage && typeof lastWork.prosthesisStage.name === 'string' && kuryeNotes.includes(lastWork.prosthesisStage.name)) {
									isKurye = true;
								}
								if (typeof lastWork.notes === 'string' && bitimNotes.includes(lastWork.notes)) {
									isBitim = true;
								}
								if (lastWork.prosthesisStage && typeof lastWork.prosthesisStage.name === 'string' && bitimNotes.includes(lastWork.prosthesisStage.name)) {
									isBitim = true;
								}
							}
						}

						return (
							<Link key={patient.id} href={`/teknisyen/hastalarim/${patient.id}`}>
								<Card className={`group h-full justify-between transition-all duration-200 hover:shadow-lg cursor-pointer ${isFullyCompleted
										? 'border-2 border-gray-600 bg-black/40 hover:border-gray-700 hover:shadow-gray-500'
										: isKurye
											? 'border-2 border-blue-300 bg-blue-50/50 hover:border-blue-400 hover:shadow-blue-100'
											: isBitim
												? 'border-2 border-gray-400 bg-gray-100 hover:border-gray-500 hover:shadow-gray-200'
												: 'border-2 border-orange-300 bg-orange-50/50 hover:border-orange-400 hover:shadow-orange-100'
									}`}>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${isFullyCompleted
														? 'bg-gradient-to-br from-gray-700 to-gray-900'
														: lastUpdateBy === 'technician'
															? 'bg-gradient-to-br from-blue-500 to-indigo-600'
															: lastUpdateBy === 'doctor'
																? 'bg-gradient-to-br from-orange-500 to-red-600'
																: 'bg-gradient-to-br from-emerald-500 to-teal-600'
													}`}>
													{isFullyCompleted && (
														<div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
															<CheckCircle2 className="w-3 h-3 text-white" />
														</div>
													)}
													<span className="text-white font-bold text-lg">
														{patient.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)}
													</span>
												</div>
												<div>
													<CardTitle className={`text-lg font-medium transition-colors text-gray-900 ${isFullyCompleted
															? 'group-hover:text-gray-100'
															: lastUpdateBy === 'technician'
																? 'group-hover:text-blue-700'
																: lastUpdateBy === 'doctor'
																	? 'group-hover:text-orange-700'
																	: 'group-hover:text-emerald-700'
														}`}>
														{patient.name}
													</CardTitle>
													{patient.dentist?.user?.name && (
														<p className="text-sm text-muted-foreground mt-1">
															Dt. {patient.dentist.user.name}
														</p>
													)}
												</div>
											</div>
											<ArrowRight className={`w-5 h-5 transition-all duration-200 text-gray-400 group-hover:translate-x-1 ${isFullyCompleted
													? 'group-hover:text-gray-300'
													: lastUpdateBy === 'technician'
														? 'group-hover:text-blue-500'
														: lastUpdateBy === 'doctor'
															? 'group-hover:text-orange-500'
															: 'group-hover:text-emerald-500'
												}`} />
										</div>
									</CardHeader>

									<CardContent className="space-y-3">
										<div className="space-y-2">
											{prosthesisTypes.length > 0 ? (
												prosthesisTypes.map(([typeName, data]) => {
													if (data.pricingType === "JAW_BASED" && data.jaws.length > 0) {
														const uniqueJaws = Array.from(new Set(data.jaws));
														const jawLabels = uniqueJaws.map(jaw => jaw === "UPPER" ? "Üst Çene" : jaw === "LOWER" ? "Alt Çene" : jaw);
														return (
															<div
																key={typeName}
																className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-100"
															>
																<div className="flex items-center space-x-2">
																	<div className="w-2 h-2 rounded-full bg-emerald-500" />
																	<span className="text-sm font-medium text-gray-900">
																		{jawLabels.join(", ")} {typeName}
																	</span>
																</div>
																<Badge
																	className={`text-xs ${isFullyCompleted
																		? 'bg-gray-800 border-gray-700'
																		: 'bg-gray-50 border-gray-100'
																	}`}
																>
																	{isFullyCompleted ? "Tamamlandı" : "Devam ediyor"}
																</Badge>
															</div>
														);
													} else {
														return (
															<div
																key={typeName}
																className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-100"
															>
																<div className="flex items-center space-x-2">
																	<div className="w-2 h-2 rounded-full bg-emerald-500" />
																	<span className="text-sm font-medium text-gray-900">
																		{data.teeth} Üye {typeName}
																	</span>
																</div>
																<Badge
																	className={`text-xs ${isFullyCompleted
																		? 'bg-gray-800 border-gray-700'
																		: 'bg-gray-50 border-gray-100'
																	}`}
																>
																	{isFullyCompleted ? "Tamamlandı" : "Devam ediyor"}
																</Badge>
															</div>
														);
													}
												})
											) : (
												<div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
													<User className="w-6 h-6 mx-auto mb-2 text-gray-400" />
													<span className="text-sm text-muted-foreground">Henüz protez işlemi yok</span>
												</div>
											)}
										</div>

										{/* Lokasyon Badge */}
										<div className="mt-3 pt-3 border-t border-gray-100">
											<div className="flex items-center justify-center">
												{isFullyCompleted ? (
													<Badge variant="outline" className="text-xs font-medium border-gray-400 text-gray-700 bg-gray-50">
														<div className="w-2 h-2 rounded-full mr-2 bg-gray-500" />
														Tamamlandı
													</Badge>
												) : isKurye ? (
													<Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50">
														<div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
														Doktorda
													</Badge>
												) : isBitim ? (
													<Badge variant="outline" className="text-xs font-medium border-gray-200 text-gray-700 bg-gray-50">
														<div className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
														Bitim Yapıldı
													</Badge>
												) : (
													<Badge variant="outline" className="text-xs font-medium border-orange-200 text-orange-700 bg-orange-50">
														<div className="w-2 h-2 rounded-full mr-2 bg-orange-500" />
														Teknisyende
													</Badge>
												)}
											</div>
										</div>
									</CardContent>

									<CardFooter className="border-t border-gray-100 pt-3">
										<div className="flex items-center justify-between w-full">
											<div className="flex items-center space-x-2 text-sm text-muted-foreground">
												<Calendar className="w-4 h-4" />
												<span>Kayıt: {new Date(patient.createdAt).toLocaleDateString("tr-TR")}</span>
											</div>
											{isFullyCompleted && (
												<span className="text-xs font-medium border-gray-600 text-gray-200 bg-gray-700 px-2 py-1 rounded-full">
													Tamamlandı
												</span>
											)}
										</div>
									</CardFooter>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
