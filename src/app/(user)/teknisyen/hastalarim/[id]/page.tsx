"use client";
import AddProsthesis from "@/components/add-prosthesis";
import AddTechnicianProsthesisSheet from "@/components/add-technician-prothesis-sheet";
import AddAdditionalTreatment from "@/components/add-additional-treatment";
import AdditionalTreatmentListReadonly from "@/components/additional-treatment-list-readonly";
import AttachmentGallery from "@/components/attachment-gallery";
import DashboardHeader from "@/components/dashboard-header";
import DeleteStageHistoryButton from "@/components/delete-stage-history-button";
import PatientNotesList from "@/components/patient-notes-list";
import UpdateTechnicianStageForm from "@/components/update-technician-stage-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime } from "@/lib/format";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	History,
	Layers,
	MapPin,
	Palette,
	Settings,
	Undo2,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import React from "react";

type DentalWork = RouterOutputs["laboratoryTechnician"]["patient"]["getDentalWorks"][0];
type StageHistoryItem = RouterOutputs["laboratoryTechnician"]["dentalWork"]["getStageHistory"][0];

const getStageProgress = (percentage: number | undefined) => {
	return percentage || 0;
};

const getStageColor = (stageName: string) => {
	const colors = {
		"Sipariş Alındı": "bg-blue-500",
		"Ölçü Alındı": "bg-yellow-500",
		"Model Hazırlandı": "bg-orange-500",
		"Prova Yapıldı": "bg-purple-500",
		Tamamlandı: "bg-green-500",
		İptal: "bg-red-500",
	};
	return colors[stageName as keyof typeof colors] || "bg-gray-500";
};

const getStageIcon = (stageName: string) => {
	switch (stageName) {
		case "Tamamlandı":
			return <CheckCircle2 className="w-4 h-4" />;
		case "İptal":
			return <AlertCircle className="w-4 h-4" />;
		default:
			return <Clock className="w-4 h-4" />;
	}
};

export default function page() {
	const params = useParams();
	const patientId = params?.id as string;

	const { data: patient, isLoading: patientLoading } = api.laboratoryTechnician.patient.getById.useQuery({
		id: patientId,
	});

	const { data: dentalWorks = [], isLoading: dentalWorksLoading } =
		api.laboratoryTechnician.patient.getDentalWorks.useQuery({
			patientId: patientId,
		}) as { data: Array<RouterOutputs["laboratoryTechnician"]["patient"]["getDentalWorks"][0] & { dentalWorkAdditionalTreatments?: any[] }>, isLoading: boolean };

	// Kuryeye Ver için teknisyen aşaması güncelleme mutation
	const updateTechnicianStageMutation = api.laboratoryTechnician.dentalWork.updateTechnicianStage.useMutation({
		onSuccess: () => {
			window.location.reload();
		},
	});

	// Tüm dentalWork'lere ait ek tedavileri topla
	const allAdditionalTreatments = dentalWorks
		.flatMap((dw) => dw.dentalWorkAdditionalTreatments || [])
		.map((t) => ({
			id: t.id,
			additionalTreatment: t.additionalTreatment,
			price: t.price,
			notes: t.notes,
		}));


		const markAsCompleted = api.laboratoryTechnician.patient.markAsCompleted.useMutation({
			onSuccess: () => {
				// Hasta tamamlandı, sayfayı yenile
				window.location.reload();
			},
		});

		// markAsOngoing mutation
		const markAsOngoing = api.laboratoryTechnician.patient.markAsOngoing.useMutation({
			onSuccess: () => {
				window.location.reload();
			},
		});

	if (patientLoading || dentalWorksLoading) {
				return (
					<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-300 rounded w-64 mb-4" />
					<div className="h-4 bg-gray-300 rounded w-32" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
					<div className="lg:col-span-3 space-y-5">
						<div className="animate-pulse bg-gray-200 rounded-lg h-96" />
					</div>
					<div className="lg:col-span-7">
						<div className="animate-pulse bg-gray-200 rounded-lg h-96" />
					</div>
				</div>
			</div>
		);
	}

	if (!patient) {
		return (
			<div className="text-center py-12">
				<h3 className="text-lg font-semibold mb-2">Hasta bulunamadı</h3>
				<p className="text-muted-foreground mb-4">Belirtilen hasta sisteme kayıtlı değil.</p>
				<Link href="/teknisyen/hastalarim">
					<Button variant="outline">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Geri Dön
					</Button>
				</Link>
			</div>
		);
	}

	// Hekim sayfasındaki gibi protez tipine göre groupla (çene bazlı/diş bazlı destekli)
	const groupedWorks = dentalWorks.reduce(
		(acc, work) => {
			const typeName = work.prosthesisType?.name || "Bilinmeyen Tip";
			const pricingType = work.prosthesisType?.pricingType || "TOOTH_BASED";
			if (!acc[typeName]) {
				acc[typeName] = {
					prosthesisType: work.prosthesisType,
					works: [],
					allTeeth: [],
					allJaws: [],
					pricingType,
					latestStage: work.prosthesisStage?.name || "",
					latestProgress: 0,
					toothColor: work.toothColor,
					notes: [],
					createdAt: work.createdAt,
				};
			}

			acc[typeName].works.push(work);
			acc[typeName].allTeeth.push(...(work.selectedTeeth || []));
			if (pricingType === "JAW_BASED" && Array.isArray(work.selectedJaws)) {
				acc[typeName].allJaws.push(...work.selectedJaws);
			}

			const workProgress = getStageProgress(work.prosthesisStage?.percentage);
			if (workProgress > acc[typeName].latestProgress) {
				acc[typeName].latestStage = work.prosthesisStage?.name || "";
				acc[typeName].latestProgress = workProgress;
			}

			if (work.notes) {
				acc[typeName].notes.push(work.notes);
			}

			if (work.createdAt < acc[typeName].createdAt) {
				acc[typeName].createdAt = work.createdAt;
			}

			return acc;
		},
		{} as Record<
			string,
			{
				prosthesisType: DentalWork["prosthesisType"];
				works: DentalWork[];
				allTeeth: string[];
				allJaws: string[];
				pricingType: string;
				latestStage: string;
				latestProgress: number;
				toothColor: DentalWork["toothColor"];
				notes: string[];
				createdAt: Date;
			}
		>,
	);

	const prosthesisTypes = Object.keys(groupedWorks);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<DashboardHeader
					title={
						<Link href="/teknisyen/hastalarim">
							<Button variant="outline">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Geri Dön
							</Button>
						</Link>
					}
				/>
			</div>

			<div className="flex flex-col gap-6 lg:grid lg:grid-cols-10">
				<div className="lg:col-span-3 space-y-5 lg:sticky lg:top-6 lg:self-start">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center text-lg">
								<User className="w-5 h-5 mr-2 text-blue-600" />
								Hasta Bilgileri
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center pb-4 border-b">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
									<span className="text-white font-bold text-xl">
										{patient.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)}
									</span>
								</div>
								<h3 className="font-semibold text-xl">{patient.name}</h3>
							</div>

							<div className="space-y-3">
								<div className="flex items-center text-sm">
									<Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
									<span>Kayıt: {formatDate(patient.createdAt)}</span>
								</div>

								{/* Prosthesis Type'lara göre listele */}
								<div className="space-y-2">
											{dentalWorksLoading ? (
												<div className="space-y-2">
													{Array.from({ length: 2 }, (_, i) => (
														<div
															key={`sidebar-loading-${Date.now()}-${i}`}
															className="animate-pulse flex items-center justify-between p-2 bg-gray-50 rounded-lg"
														>
															<div className="flex items-center space-x-2">
																<div className="w-4 h-4 bg-gray-300 rounded" />
																<div className="h-4 bg-gray-300 rounded w-24" />
															</div>
															<div className="h-4 bg-gray-300 rounded w-16" />
														</div>
													))}
												</div>
											) : Object.entries(groupedWorks).length > 0 ? (
												Object.entries(groupedWorks).map(([typeName, group]) => {
													if (group.pricingType === "JAW_BASED" && group.allJaws.length > 0) {
														const uniqueJaws = Array.from(new Set(group.allJaws));
														const jawLabels = uniqueJaws.map(jaw => jaw === "UPPER" ? "Üst Çene" : jaw === "LOWER" ? "Alt Çene" : jaw);
														return (
															<div key={typeName} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
																<div className="flex items-center space-x-2">
																	<Layers className="w-4 h-4 text-muted-foreground" />
																	<span className="text-sm font-medium">
																		{jawLabels.join(", ")} {typeName}
																	</span>
																</div>
																<Badge variant={group.latestProgress >= 100 ? "default" : "secondary"} className="text-xs">
																	{group.latestProgress >= 100 ? "Tamamlandı" : "Devam ediyor"}
																</Badge>
															</div>
														);
													}
													// Diş bazlı ise mevcut gibi göster
													const uniqueTeeth = [...new Set(group.allTeeth)];
													return (
														<div key={typeName} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
															<div className="flex items-center space-x-2">
																<Layers className="w-4 h-4 text-muted-foreground" />
																<span className="text-sm font-medium">
																	{uniqueTeeth.length} Üye {typeName}
																</span>
															</div>
															<Badge variant={group.latestProgress >= 100 ? "default" : "secondary"} className="text-xs">
																{group.latestProgress >= 100 ? "Tamamlandı" : "Devam ediyor"}
															</Badge>
														</div>
													);
												})
											) : (
										<div className="text-center p-4 text-sm text-muted-foreground">Henüz protez işlemi yok</div>
									)}
								</div>
							</div>

							{patient.notes && (
								<div className="pt-4 border-t">
									<h4 className="font-medium text-sm mb-2 flex items-center">
										<Settings className="w-4 h-4 mr-1" />
										Notlar
									</h4>
									<p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{patient.notes}</p>
								</div>
							)}

													{/* Bitim Yap ve Tekrar doktora/kuryeye ver butonları */}
													<div className="pt-4 border-t space-y-2">
														{!patient.isCompleted && (
															<>
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<Button
																			className="w-full bg-green-600 hover:bg-green-700 text-white"
																			size="sm"
																			disabled={markAsCompleted.isPending}
																		>
																			<CheckCircle2 className="w-4 h-4 mr-2" />
																			{markAsCompleted.isPending ? 'Tamamlanıyor...' : 'Bitim Yap'}
																		</Button>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>Bitim Yap</AlertDialogTitle>
																			<AlertDialogDescription>
																				Bu hastayı bitim yapmak istediğinizden emin misiniz? Bu işlemden sonra hasta
																				"Tamamlandı" olarak işaretlenecek. Yanlışlıkla yaptıysanız daha sonra "Bitimi
																				Geri Al" ile geri alabilirsiniz.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>İptal</AlertDialogCancel>
																			<AlertDialogAction onClick={() => markAsCompleted.mutate({ id: patient.id })}>
																				Evet, Bitim Yap
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<Button
																			className="w-full bg-blue-600 hover:bg-blue-700 text-white"
																			size="sm"
																			disabled={updateTechnicianStageMutation.isPending || dentalWorks.length === 0}
																		>
																			{updateTechnicianStageMutation.isPending ? 'Gönderiliyor...' : 'Kuryeye Ver'}
																		</Button>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>Kuryeye Ver</AlertDialogTitle>
																			<AlertDialogDescription>
																				Bu hastayı kuryeye vermek istediğinizden emin misiniz?
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>İptal</AlertDialogCancel>
																			<AlertDialogAction
																				onClick={() => {
																					const latestDentalWork = dentalWorks[0];
																					if (!latestDentalWork) return;
																					updateTechnicianStageMutation.mutate({
																						dentalWorkId: latestDentalWork.id,
																						technicianStageId: latestDentalWork.technicianStageId || undefined,
																						notes: "KURYEE_VERILDI",
																					});
																				}}
																			>
																				Evet, Kuryeye Ver
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															</>
														)}
														{patient.isCompleted && patient.completedAt && (
															<div className="text-center space-y-2">
																<Badge className="w-full bg-green-600 text-white py-2">
																	<CheckCircle2 className="w-4 h-4 mr-2" />
																	Tamamlandı
																</Badge>
																<p className="text-xs text-muted-foreground mt-2">
																	{new Date(patient.completedAt).toLocaleDateString("tr-TR")} tarihinde tamamlandı
																</p>
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<Button
																			variant="outline"
																			size="sm"
																			className="w-full"
																			disabled={markAsOngoing.isPending}
																		>
																			<Undo2 className="w-4 h-4 mr-2" />
																			{markAsOngoing.isPending ? "Geri Alınıyor..." : "Bitimi Geri Al"}
																		</Button>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>Bitimi Geri Al</AlertDialogTitle>
																			<AlertDialogDescription>
																				Bu hastanın bitim durumunu geri almak istediğinizden emin misiniz? Hasta
																				tekrar "Devam Ediyor" durumuna alınacak.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>İptal</AlertDialogCancel>
																			<AlertDialogAction onClick={() => markAsOngoing.mutate({ id: patient.id })}>
																				Evet, Geri Al
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															</div>
														)}
													</div>
						</CardContent>
					</Card>

					{/* Hasta Notları */}
					<PatientNotesList patientId={patient.id} />
				</div>

				<div className="lg:col-span-7 mt-6 lg:mt-0">
					{dentalWorksLoading ? (
						<Card>
							<CardHeader>
								<div className="animate-pulse">
									<div className="h-6 bg-gray-300 rounded w-48" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{Array.from({ length: 3 }, (_, i) => (
										<div key={`content-loading-${Date.now()}-${i}`} className="animate-pulse">
											<div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
											<div className="h-3 bg-gray-300 rounded w-1/2" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					) : prosthesisTypes.length === 0 ? (
						<Card>
							<CardContent className="text-center py-12">
								<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
									<Layers className="w-8 h-8 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-lg">Henüz protez işlemi bulunmuyor.</p>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Layers className="w-5 h-5 mr-2 text-blue-600" />
									Protez İşlemleri
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue={prosthesisTypes[0]} className="space-y-6">
									<TabsList className="h-auto p-1">
										{prosthesisTypes.map((type) => {
											const group = groupedWorks[type];
											if (!group) return null;
											if (group.pricingType === "JAW_BASED" && group.allJaws.length > 0) {
												const uniqueJaws = Array.from(new Set(group.allJaws));
												const jawLabels = uniqueJaws.map(jaw => jaw === "UPPER" ? "Üst Çene" : jaw === "LOWER" ? "Alt Çene" : jaw);
												return (
													<TabsTrigger key={type} value={type} className="flex-col gap-1 h-auto p-3">
														<div className="font-medium">{type}</div>
														<div className="text-xs text-muted-foreground">
															{jawLabels.join(", ")} • {group.latestProgress}%
														</div>
													</TabsTrigger>
												);
											}
											// Diş bazlı ise mevcut gibi göster
											const uniqueTeeth = [...new Set(group.allTeeth)];
											return (
												<TabsTrigger key={type} value={type} className="flex-col gap-1 h-auto p-3">
													<div className="font-medium">{type}</div>
													<div className="text-xs text-muted-foreground">
														{uniqueTeeth.length} Diş • {group.latestProgress}%
													</div>
												</TabsTrigger>
											);
										})}
										<TabsTrigger value="yeni-protez" className="flex-col gap-1 h-auto p-3">
											<div className="font-medium">+ Yeni Protez</div>
											<div className="text-xs text-muted-foreground">Protez Ekle</div>
										</TabsTrigger>
										<TabsTrigger value="yeni-ek-tedavi" className="flex-col gap-1 h-auto p-3">
											<div className="font-medium">+ Ek Tedavi</div>
											<div className="text-xs text-muted-foreground">Ek Tedavi Ekle</div>
										</TabsTrigger>
									</TabsList>

									{prosthesisTypes.map((type) => {
										const group = groupedWorks[type];
										if (!group) return null;

										const stageColor = getStageColor(group.latestStage);
										const stageIcon = getStageIcon(group.latestStage);
										const uniqueTeeth = [...new Set(group.allTeeth)];
										const latestWork = group.works[0];
										if (!latestWork) return null;

										return (
											<TabsContent key={type} value={type} className="space-y-6">
												<LatestStageInfoProvider latestWork={latestWork} groupLatestStage={group.latestStage}>
													{(latestStageInfo) => (
														<UpdateTechnicianStageForm
															dentalWorkId={latestWork.id}
															currentTechnicianStageId={latestWork.technicianStageId || undefined}
															currentProsthesisStage={latestWork.prosthesisStage?.name}
															latestStageInfo={latestStageInfo}
														/>
													)}
												</LatestStageInfoProvider>
												{/* Ek Tedaviler Alanı - Aşama güncelleme altı */}
												<AdditionalTreatmentListReadonly treatments={allAdditionalTreatments} hidePrices={true} />
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-semibold text-lg flex items-center">
															{type}
														</h4>
														<p className="text-sm text-muted-foreground">
															{new Date(group.createdAt).toLocaleDateString("tr-TR")} tarihinde başlatıldı
														</p>
													</div>
													<div className="flex items-center gap-2">
														<div className={`w-3 h-3 rounded-full ${stageColor}`} />
														<Badge
															variant={
																group.latestStage === "Tamamlandı"
																	? "default"
																	: group.latestStage === "İptal"
																		? "destructive"
																		: "secondary"
															}
															className="flex items-center gap-1"
														>
															{stageIcon}
															{group.latestStage || "Aşama Belirtilmedi"}
														</Badge>
													</div>
												</div>

												<div>
													<div className="flex justify-between items-center mb-2">
														<span className="text-sm font-medium">İşlem İlerlemesi</span>
														<span className="text-sm text-muted-foreground">{group.latestProgress}%</span>
													</div>
													<Progress value={group.latestProgress} className="h-2" />
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
													{group.toothColor && (
														<div className="flex items-center space-x-2">
															<Palette className="w-4 h-4 text-muted-foreground" />
															<span className="font-medium">Renk:</span>
															<span className="text-muted-foreground">{group.toothColor.name}</span>
														</div>
													)}

													<div className="flex items-center space-x-2">
														<MapPin className="w-4 h-4 text-muted-foreground" />
														<span className="font-medium">Dişler:</span>
														<span className="text-muted-foreground">
															{uniqueTeeth
																.map((t) => Number(t))
																.sort((a, b) => a - b)
																.join(", ")}{" "}
															({uniqueTeeth.length} diş)
														</span>
													</div>

													<div className="flex items-center space-x-2">
														<span className="font-medium">İşlem Sayısı:</span>
														<span className="text-muted-foreground">{group.works.length} adet</span>
													</div>
												</div>

												{group.notes.length > 0 && (
													<div className="border-t pt-4">
														<h5 className="font-medium text-sm mb-2 flex items-center">
															<Settings className="w-4 h-4 mr-1" />
															İşlem Notları
														</h5>
														<div className="space-y-2">
															{group.notes
																.filter((note) => !["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI", "BITIM_YAPILDI"].includes(note))
																.map((note, noteIndex) => (
																<p
																	key={`${type}-note-${note.slice(0, 10)}-${noteIndex}`}
																	className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg"
																>
																	{note}
																</p>
															))}
														</div>
													</div>
												)}

												{/* Protez İlk Oluşturulma Resimleri */}
												{(() => {
													const allAttachments = group.works
														.flatMap((work) => {
															const attachments = work.attachments as any[] || [];
															return attachments;
														})
														.filter((attachment: any) => attachment?.url || attachment?.fileUrl)
														.map((attachment: any) => ({
															url: attachment.url || attachment.fileUrl,
															name: attachment.name || 'Dosya',
															type: attachment.type || 'image'
														}));
													
													if (allAttachments.length > 0) {
														return (
															<div className="border-t pt-4">
																<h5 className="font-medium text-sm mb-2 flex items-center">
																	<FileText className="w-4 h-4 mr-1" />
																	Protez Resimleri
																</h5>
																<AttachmentGallery attachments={allAttachments} compact={false} />
															</div>
														);
													}
													return null;
												})()}
												

												<StageHistorySection works={group.works} />
											</TabsContent>
										);
									})}
									<TabsContent value="yeni-protez" className="space-y-6">
										<div className="max-w-2xl">
											<div className="mb-6">
												<h3 className="text-lg font-semibold mb-2">Yeni Protez Ekle</h3>
												<p className="text-sm text-muted-foreground">
													Hastaya yeni bir protez işlemi ekleyin. Gerekli bilgileri doldurun.
												</p>
											</div>
											<AddProsthesis patientId={patient.id} dentistId={patient?.dentist?.id} />
										</div>
									</TabsContent>
									<TabsContent value="yeni-ek-tedavi" className="space-y-6">
										<div className="max-w-2xl">
											<div className="mb-6">
												<h3 className="text-lg font-semibold mb-2">Yeni Ek Tedavi Ekle</h3>
												<p className="text-sm text-muted-foreground">
													Hastaya yeni bir ek tedavi ekleyin. Gerekli bilgileri doldurun.
												</p>
											</div>
											{/* Son dental work üzerinden ek tedavi ekleme */}
											{dentalWorks.length > 0 ? (
												<AddAdditionalTreatment dentalWorkId={dentalWorks[0]!.id} hideUnitPriceInput={true} />
											) : (
												<div className="text-sm text-muted-foreground">Önce bir protez işlemi eklemelisiniz.</div>
											)}
										</div>
									</TabsContent>
								</Tabs>
								
							</CardContent>
						</Card>
					)}
				</div>
			</div>
			{/* AddTechnicianProsthesisSheet component'i eklendi - teknisyen için */}
			<AddTechnicianProsthesisSheet />
		</div>
	);
}

function LatestStageInfoProvider({ 
	latestWork, 
	groupLatestStage, 
	children 
}: { 
	latestWork: DentalWork;
	groupLatestStage: string;
	children: (latestStageInfo: {
		type: 'prosthesis' | 'technician';
		name: string;
		updatedAt: Date;
	}) => React.ReactNode;
}) {
	// Prosthesis stage history
	const { data: prosthesisHistory = [] } = api.laboratoryTechnician.dentalWork.getStageHistory.useQuery(
		{ dentalWorkId: latestWork.id },
		{ enabled: Boolean(latestWork.id) },
	);

	// Technician stage history
	const { data: technicianHistory = [] } = api.laboratoryTechnician.dentalWork.getTechnicianStageHistory.useQuery(
		{ dentalWorkId: latestWork.id },
		{ enabled: Boolean(latestWork.id) },
	);

	// Combine and sort all history to find the latest stage
	const allHistory = [
		...prosthesisHistory.map((item: any) => ({ ...item, type: 'prosthesis' as const })),
		...technicianHistory.map((item: any) => ({ ...item, type: 'technician' as const }))
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Get the most recent stage
	const latestStageInfo = (() => {
		if (allHistory.length > 0) {
			const latest = allHistory[0];
			const stageName = latest.type === 'prosthesis' 
				? latest.prosthesisStage?.name || 'Bilinmeyen Doktor Aşaması'
				: latest.technicianStage?.name || 'Bilinmeyen Teknisyen Aşaması';
			
			return {
				type: latest.type,
				name: stageName,
				updatedAt: new Date(latest.createdAt)
			};
		}
		
		// Fallback to current prosthesis stage if no history
		return {
			type: 'prosthesis' as const,
			name: latestWork.prosthesisStage?.name || groupLatestStage,
			updatedAt: new Date(latestWork.updatedAt)
		};
	})();

	return <>{children(latestStageInfo)}</>;
}

function StageHistorySection({ works }: { works: DentalWork[] }) {
	// Prosthesis stage history
	const stageHistoryQueries = works.map((work: DentalWork) =>
		api.laboratoryTechnician.dentalWork.getStageHistory.useQuery(
			{ dentalWorkId: work.id },
			{ enabled: Boolean(work.id) },
		),
	);

	// Technician stage history
	const technicianStageHistoryQueries = works.map((work: DentalWork) =>
		api.laboratoryTechnician.dentalWork.getTechnicianStageHistory.useQuery(
			{ dentalWorkId: work.id },
			{ enabled: Boolean(work.id) },
		),
	);

	const prosthesisHistory = stageHistoryQueries
		.flatMap((query: { data?: StageHistoryItem[] }) => query.data || [])
		.map((item: StageHistoryItem) => ({ ...item, type: 'prosthesis' as const }));

	const technicianHistory = technicianStageHistoryQueries
		.flatMap((query: { data?: any[] }) => query.data || [])
		.map((item: any) => ({ ...item, type: 'technician' as const }));

	const allHistory = [...prosthesisHistory, ...technicianHistory]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Teknisyen sadece kendi eklediği en son teknisyen aşamasını geri alabilir
	const latestTechnicianEntryId = technicianHistory
		.slice()
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.id;

	const isLoading = stageHistoryQueries.some((query: { isLoading: boolean }) => query.isLoading) ||
		technicianStageHistoryQueries.some((query: { isLoading: boolean }) => query.isLoading);

	if (isLoading) {
		return (
			<div className="border-t pt-4">
				<h5 className="font-medium text-sm mb-3 flex items-center">
					<History className="w-4 h-4 mr-1" />
					İşlem Aşamaları
				</h5>
				<div className="space-y-3">
					{Array.from({ length: 3 }, (_, i) => (
						<div key={`stage-loading-${Date.now()}-${i}`} className="animate-pulse flex space-x-3">
							<div className="w-6 h-6 bg-gray-300 rounded-full" />
							<div className="flex-1">
								<div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
								<div className="h-3 bg-gray-300 rounded w-1/2" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (allHistory.length === 0) {
		return (
			<div className="border-t pt-4">
				<h5 className="font-medium text-sm mb-2 flex items-center">
					<History className="w-4 h-4 mr-1" />
					İşlem Aşamaları
				</h5>
				<p className="text-sm text-muted-foreground">Henüz aşama geçmişi bulunmuyor.</p>
			</div>
		);
	}

	return (
		<div className="border-t pt-4">
			<h5 className="font-medium text-sm mb-3 flex items-center">
				<History className="w-4 h-4 mr-1" />
				Tüm İşlem Aşamaları ({allHistory.length})
			</h5>

			<div className="space-y-3">
					{allHistory.map((history: any, index: number) => {
					const isProsthesis = history.type === 'prosthesis';

					// Bitim kaydı kontrolü (herhangi bir type için)
					const isBitimRecord = history.notes === "BITIM_YAPILDI";
					// Kuryeye verildi notları (sunucuda farklı stringler olabilir)
					const isKuryeRecord = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI", "TEKRAR_DOKTORA_VERILDI"].includes(String(history.notes));

					const stageName = isBitimRecord
						? "Bitim Yapıldı"
						: isKuryeRecord
							? "Kuryeye Verildi"
							: (isProsthesis ? history.prosthesisStage?.name : history.technicianStage?.name);

					const bgColorClass = isBitimRecord
						? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
						: isKuryeRecord
							? "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200"
							: (isProsthesis
								? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
								: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200");

					const iconColorClass = isBitimRecord
						? "border-green-500 bg-green-100"
						: isKuryeRecord
							? "border-cyan-500 bg-cyan-100"
							: (isProsthesis ? "border-blue-500 bg-blue-100" : "border-orange-500 bg-orange-100");

					const iconClass = isBitimRecord
						? "text-green-600"
						: isKuryeRecord
							? "text-cyan-600"
							: (isProsthesis ? "text-blue-600" : "text-orange-600");
					
					return (
						<div key={`${history.type}-${history.id}`} className="relative">
							<div className="flex items-start justify-center space-x-3">
								<div className={`flex-shrink-0 w-6 h-6 ${iconColorClass} border-2 rounded-full flex items-center justify-center`}>
									{index === 0 ? (
										<CheckCircle2 className={`w-3 h-3 ${iconClass}`} />
									) : (
										<div className={`w-2 h-2 rounded-full ${isProsthesis ? 'bg-blue-500' : 'bg-orange-500'}`} />
									)}
								</div>

								<div className="flex-1 min-w-0">
									<div className={`${bgColorClass} rounded-lg p-3 border`}>
										<div className="flex items-center justify-between mb-1">
											<div className="flex items-center gap-2">
												<Badge 
													variant={index === 0 ? "default" : "secondary"} 
													className={`text-xs ${
														isBitimRecord 
															? 'bg-green-100 text-green-800' 
															: (isProsthesis ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800')
													}`}
												>
													{stageName}
												</Badge>
												<Badge variant="outline" className="text-xs">
													{isBitimRecord 
														? 'Bitim Kaydı' 
														: (isProsthesis ? 'Doktor Aşaması' : 'Teknisyen Aşaması')
													}
												</Badge>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground">
													{new Date(history.createdAt).toLocaleDateString("tr-TR", {
														day: "numeric",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
												{!isProsthesis && !isBitimRecord && history.id === latestTechnicianEntryId && (
													<DeleteStageHistoryButton
														role="technician"
														historyId={history.id}
														stageName={stageName}
														onDeleted={() => window.location.reload()}
													/>
												)}
											</div>
										</div>

									{history.notes &&
										history.notes !== "BITIM_YAPILDI" &&
										history.notes !== "KURYEE_VERILDI" &&
										history.notes !== "TEKRAR_DOKTORA_VERILDI" && (
											<div className="mt-2">
												<div className="flex items-center text-xs text-muted-foreground mb-1">
													<FileText className="w-3 h-3 mr-1" />
													<span>Notlar</span>
												</div>
												<p className="text-xs bg-white/60 p-2 rounded border text-gray-700">{history.notes}</p>
											</div>
									)}


									{isBitimRecord && (
										<div className="mt-2">
											<div className="flex items-center text-xs text-muted-foreground mb-1">
												<CheckCircle2 className="w-3 h-3 mr-1" />
												<span>Durum</span>
											</div>
											<p className="text-xs bg-green-50 p-2 rounded border border-green-200 text-green-700">
												Hasta bitimi teknisyen tarafından yapıldı
											</p>
										</div>
									)}

									{isKuryeRecord && (
										<div className="mt-2">
											<div className="flex items-center text-xs text-muted-foreground mb-1">
												<CheckCircle2 className="w-3 h-3 mr-1 text-cyan-600" />
												<span>Durum</span>
											</div>
											<p className="text-xs bg-cyan-50 p-2 rounded border border-cyan-200 text-cyan-700">
												{isProsthesis
													? 'Hasta kuryeye doktor tarafından verildi'
													: 'İş kuryeye teknisyen tarafından verildi'}
											</p>
										</div>
									)}

									{(() => {
										const attachments = history.attachments || [];
										const validAttachments = attachments.filter((attachment: any) => attachment?.fileUrl);
										if (validAttachments.length > 0) {
											return (
												<div className="mt-2">
													<AttachmentGallery attachments={validAttachments} compact={true} />
												</div>
											);
										}
										return null;
									})()}
								</div>
							</div>
						</div>

						{index < allHistory.length - 1 && (
							<div className={`absolute left-3 top-6 w-0.5 h-full bg-gradient-to-b ${
								isProsthesis ? 'from-blue-300 to-blue-200' : 'from-orange-300 to-orange-200'
							}`} />
						)}
					</div>
					);
				})}

				{allHistory.length > 10 && (
					<p className="text-xs text-muted-foreground text-center py-2">ve {allHistory.length - 10} aşama daha...</p>
				)}
			</div>
		</div>
	);
}
