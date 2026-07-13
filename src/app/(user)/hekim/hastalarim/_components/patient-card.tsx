"use client";


import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, User, XCircle, CheckCircle2, ArrowRight, Repeat } from "lucide-react";
import Link from "next/link";
import { getCompletionState } from "@/lib/patient-completion";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DentalWork = {
	selectedTeeth?: string[];
	prosthesisType?: {
		name: string;
	} | null;
	prosthesisStage?: {
		percentage: number;
		name?: string;
	} | null;
	notes?: string;
	isCompleted?: boolean;
};

type Patient = {
	id: string;
	name: string;
	createdAt: string | Date;
	dentalWorks?: DentalWork[];
	dentist?: {
		user: {
			name: string;
		};
	};
	_count: {
		dentalWorks: number;
	};
	isSentToTechnician?: boolean;
	lastSentToTechnicianAt?: string | Date | null;
} & { isCompleted?: boolean; lastUpdateBy?: 'doctor' | 'technician' | null; hasFeedback?: boolean };

type PatientCardProps = {
	patient: Patient;
};

export function PatientCard({ patient }: PatientCardProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const sendToTechnician = api.dentist.patient.sendToTechnician.useMutation({
		onSuccess: () => {
			setLoading(false);
			router.refresh();
		},
		onError: () => setLoading(false),
	});

	// Yeni grup yapısı: hem diş bazlı hem çene bazlı destekler
	const groupedByType =
		patient.dentalWorks?.reduce(
			(acc, work) => {
				const typeName = work.prosthesisType?.name || "Bilinmeyen";
				const pricingType = (work as any).prosthesisType?.pricingType || "TOOTH_BASED";
				if (!acc[typeName]) {
					acc[typeName] = {
						count: 0,
						completedCount: 0,
						teeth: 0,
						jaws: [],
						pricingType,
						maxPercentage: 0,
					};
				}
				acc[typeName].count += 1;
				if (work.isCompleted) {
					acc[typeName].completedCount += 1;
				}
				if (pricingType === "JAW_BASED") {
					// Çene bazlı ise seçili çeneleri ekle
					if (Array.isArray((work as any).selectedJaws)) {
						acc[typeName].jaws.push(...((work as any).selectedJaws));
					}
				} else {
					acc[typeName].teeth += work.selectedTeeth?.length || 0;
				}

				const currentPercentage = work.prosthesisStage?.percentage || 0;
				if (currentPercentage > acc[typeName].maxPercentage) {
					acc[typeName].maxPercentage = currentPercentage;
				}

				return acc;
			},
			{} as Record<
				string,
				{ count: number; completedCount: number; teeth: number; jaws: string[]; pricingType: string; maxPercentage: number }
			>,
		) || {};

	const prosthesisTypes = Object.entries(groupedByType);

	// Yüzde kontrolü kaldırıldı - sadece manuel bitim kontrolü

	const isFullyCompleted = patient.isCompleted || false;
	const completionState = getCompletionState(patient.dentalWorks);
	const isPartiallyCompleted = completionState === "partial";
	const lastUpdateBy = patient.lastUpdateBy;
	const isSentToTechnician = !!patient.isSentToTechnician;


	// En son dentalWork'un durumu kontrolü
	const lastStageKurye = (() => {
		if (!patient.dentalWorks || patient.dentalWorks.length === 0) return false;
		const worksSorted = [...patient.dentalWorks].sort((a, b) => {
			const aPerc = a.prosthesisStage?.percentage || 0;
			const bPerc = b.prosthesisStage?.percentage || 0;
			return bPerc - aPerc;
		});
		const lastWork = worksSorted[0];
		const kuryeNotes = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI"];
		// Öncelik: notes alanı varsa onu kontrol et, yoksa prosthesisStage.name kontrol et
		if (lastWork) {
			if (typeof lastWork.notes === 'string' && kuryeNotes.includes(lastWork.notes)) {
				return true;
			}
			if (lastWork.prosthesisStage && typeof lastWork.prosthesisStage.name === 'string' && kuryeNotes.includes(lastWork.prosthesisStage.name)) {
				return true;
			}
		}
		return false;
	})();

	const lastStageBitim = (() => {
		if (!patient.dentalWorks || patient.dentalWorks.length === 0) return false;
		const worksSorted = [...patient.dentalWorks].sort((a, b) => {
			const aPerc = a.prosthesisStage?.percentage || 0;
			const bPerc = b.prosthesisStage?.percentage || 0;
			return bPerc - aPerc;
		});
		const lastWork = worksSorted[0];
		const bitimNotes = ["BITIM_YAPILDI"];
		if (lastWork) {
			if (typeof lastWork.notes === 'string' && bitimNotes.includes(lastWork.notes)) {
				return true;
			}
			if (lastWork.prosthesisStage && typeof lastWork.prosthesisStage.name === 'string' && bitimNotes.includes(lastWork.prosthesisStage.name)) {
				return true;
			}
		}
		return false;
	})();

	const handleCardClick = (e: React.MouseEvent) => {
		// Feedback butonuna tıklandığında card linkini engellemek için
		const target = e.target as HTMLElement;
		if (target.closest('[data-prevent-navigation]')) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
				<Card className={`group h-full justify-between transition-all duration-200 hover:shadow-lg cursor-pointer ${
					isFullyCompleted
						? 'border-2 border-gray-600 bg-black/40 hover:border-gray-700 hover:shadow-gray-500'
						: isPartiallyCompleted
						? 'border-2 border-amber-400 bg-amber-50/60 hover:border-amber-500 hover:shadow-amber-200'
						: lastStageKurye
						? 'border-2 border-blue-300 bg-blue-50/50 hover:border-blue-400 hover:shadow-blue-100'
						: lastStageBitim
						? 'border-2 border-gray-400 bg-gray-100 hover:border-gray-500 hover:shadow-gray-200'
						: 'border-2 border-orange-300 bg-orange-50/50 hover:border-orange-400 hover:shadow-orange-100'
				}`}>
			<Link href={`/hekim/hasta/${patient.id}`} onClick={handleCardClick} className="block">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
								isFullyCompleted
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
								<CardTitle className={`text-lg font-medium transition-colors text-gray-900 ${
									isFullyCompleted
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
						<ArrowRight className={`w-5 h-5 transition-all duration-200 text-gray-400 group-hover:translate-x-1 ${
							isFullyCompleted
								? 'group-hover:text-gray-300'
								: lastUpdateBy === 'technician'
								? 'group-hover:text-blue-500'
								: lastUpdateBy === 'doctor'
								? 'group-hover:text-orange-500'
								: 'group-hover:text-emerald-500'
							}`}/>
					</div>
				</CardHeader>

				<CardContent className="space-y-3">
					<div className="space-y-2">
						{prosthesisTypes.length > 0 ? (
							prosthesisTypes.map(([typeName, data]) => {
								// Çene bazlı ise çene isimlerini göster
								if (data.pricingType === "JAW_BASED") {
									let jawText = "Belirtilmemiş";
									const uniqueJaws = Array.from(new Set(data.jaws));
									if (uniqueJaws.length > 0) {
										const jawLabels = uniqueJaws.map(jaw => jaw === "UPPER" ? "Üst Çene" : jaw === "LOWER" ? "Alt Çene" : jaw);
										jawText = jawLabels.join(", ");
									} else if ((data as any).jawType) {
										jawText = (data as any).jawType === "UPPER" ? "Üst Çene" : (data as any).jawType === "LOWER" ? "Alt Çene" : "Belirtilmemiş";
									}
									const isGroupCompleted = data.completedCount === data.count;
									return (
										<div
											key={typeName}
											className={`flex items-center justify-between p-3 rounded-lg border ${
												isGroupCompleted
													? 'bg-gray-800 border-gray-700'
													: 'bg-gray-50 border-gray-100'
												}`}
										>
											<div className="flex items-center space-x-2">
												<div className={`w-2 h-2 rounded-full ${
													isGroupCompleted ? 'bg-gray-400' : 'bg-emerald-500'
												}`}/>
												<span className={`text-sm font-medium ${
													isGroupCompleted ? 'text-gray-200' : 'text-gray-900'
												}`}>
													{jawText} {typeName}
												</span>
											</div>
											<Badge
												variant="outline"
												className={`text-xs font-medium ${
													isGroupCompleted
														? "border-gray-600 text-gray-200 bg-gray-700"
														: "border-blue-200 text-blue-700 bg-blue-50"
													}`}
												>
													{isGroupCompleted ? "Tamamlandı" : "Devam ediyor"}
												</Badge>
										</div>
									);
								}
								// Diş bazlı ise üye sayısı ile göster, çene bazlı ise sadece çene ve tip adı göster
								if (data.pricingType === "TOOTH_BASED") {
									const isGroupCompleted = data.completedCount === data.count;
									return (
										<div
											key={typeName}
											className={`flex items-center justify-between p-3 rounded-lg border ${
												isGroupCompleted
												? 'bg-gray-800 border-gray-700'
												: 'bg-gray-50 border-gray-100'
											}`}
										>
											<div className="flex items-center space-x-2">
												<div className={`w-2 h-2 rounded-full ${
													isGroupCompleted ? 'bg-gray-400' : 'bg-emerald-500'
												}`}/>
												<span className={`text-sm font-medium ${
													isGroupCompleted ? 'text-gray-200' : 'text-gray-900'
												}`}>
													{data.teeth} Üye {typeName}
												</span>
											</div>
											<Badge
												variant="outline"
												className={`text-xs font-medium ${
													isGroupCompleted
														? "border-gray-600 text-gray-200 bg-gray-700"
														: "border-blue-200 text-blue-700 bg-blue-50"
													}`}
												>
													{isGroupCompleted ? "Tamamlandı" : "Devam ediyor"}
												</Badge>
										</div>
									);
								} else if (data.pricingType === "JAW_BASED") {
									// Çene bazlıda tekrar eden çeneleri kaldırıp sadece çene ve tip adı göster
									const uniqueJaws = Array.from(new Set(data.jaws));
									const jawLabels = uniqueJaws.map(jaw => jaw === "UPPER" ? "Üst Çene" : jaw === "LOWER" ? "Alt Çene" : jaw);
									const isGroupCompleted = data.completedCount === data.count;
									return (
										<div
											key={typeName}
											className={`flex items-center justify-between p-3 rounded-lg border ${
												isGroupCompleted
													? 'bg-gray-800 border-gray-700'
													: 'bg-gray-50 border-gray-100'
												}`}
										>
											<div className="flex items-center space-x-2">
												<div className={`w-2 h-2 rounded-full ${
													isGroupCompleted ? 'bg-gray-400' : 'bg-emerald-500'
												}`}/>
												<span className={`text-sm font-medium ${
													isGroupCompleted ? 'text-gray-200' : 'text-gray-900'
												}`}>
													{jawLabels.join(", ")} {typeName}
												</span>
											</div>
											<Badge
												variant="outline"
												className={`text-xs font-medium ${
													isGroupCompleted
														? "border-gray-600 text-gray-200 bg-gray-700"
														: "border-blue-200 text-blue-700 bg-blue-50"
													}`}
												>
													{isGroupCompleted ? "Tamamlandı" : "Devam ediyor"}
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
				
				{/* Lokasyon Badge - Sadece devam eden hastalar için */}
								{/* Bazı tedaviler tamamlanmış bazıları devam ediyorsa "Kısmen Tamamlandı" etiketi göster */}
								{isPartiallyCompleted && (
									<div className="mt-3 pt-3 border-t border-gray-100">
										<div className="flex items-center justify-center">
											<Badge
												variant="outline"
												className="text-xs font-medium border-amber-300 text-amber-800 bg-amber-100"
											>
												<div className="w-2 h-2 rounded-full mr-2 bg-amber-500"/>
												Kısmen Tamamlandı
											</Badge>
										</div>
									</div>
								)}
								{/* Sadece en son aşama Kuryeye Verildi ise ve tamamlanmadıysa "Doktorda" etiketi göster */}
								{!isPartiallyCompleted && lastStageKurye && !isFullyCompleted && (
									<div className="mt-3 pt-3 border-t border-gray-100">
										<div className="flex items-center justify-center">
											<Badge 
												variant="outline" 
												className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50"
											>
												<div className="w-2 h-2 rounded-full mr-2 bg-blue-500"/>
												Doktorda
											</Badge>
										</div>
									</div>
								)}
								{/* Sadece en son aşama ne Kuryeye Verildi ne de Bitim Yapıldı ise ve tamamlanmadıysa "Teknisyende" etiketi göster */}
								{!isPartiallyCompleted && !lastStageKurye && !lastStageBitim && !isFullyCompleted && (
									<div className="mt-3 pt-3 border-t border-gray-100">
										<div className="flex items-center justify-center">
											<Badge 
												variant="outline" 
												className="text-xs font-medium border-orange-200 text-orange-700 bg-orange-50"
											>
												<div className="w-2 h-2 rounded-full mr-2 bg-orange-500"/>
												Teknisyende
											</Badge>
										</div>
									</div>
								)}
				</CardContent>
			</Link>
			<CardFooter className="border-t border-gray-100 pt-3">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center space-x-2 text-sm text-muted-foreground">
						<Calendar className="w-4 h-4" />
						<span>Kayıt: {new Date(patient.createdAt).toLocaleDateString("tr-TR")}</span>
					</div>
					<div className="flex items-center gap-1">
						{isFullyCompleted && (
							<span className="text-xs font-medium text-gray-200 bg-gray-700 px-2 py-1 rounded-full">
								Tamamlandı
							</span>
						)}
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}