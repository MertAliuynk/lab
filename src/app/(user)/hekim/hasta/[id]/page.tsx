import AttachmentGallery from "@/components/attachment-gallery";
import DashboardHeader from "@/components/dashboard-header";
import DeleteStageHistoryButton from "@/components/delete-stage-history-button";
import EditProsthesisSheet from "@/components/edit-prosthesis-sheet";
import PatientNotesList from "@/components/patient-notes-list";
import AddDentistProsthesis from "@/components/add-dentist-prosthesis";
import DentistPatientCompletion from "@/components/dentist-patient-completion";
import { Badge } from "@/components/ui/badge";
import AdditionalTreatmentListReadonly from "@/components/additional-treatment-list-readonly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdateDeliveryDateForm from "@/components/update-delivery-date-form";
import UpdateStageForm from "@/components/update-stage-form";
import { formatDate, formatDateTime, parseDeliveryDateNote } from "@/lib/format";
import { api } from "@/trpc/server";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CalendarClock,
	CheckCircle2,
	Clock,
	Edit,
	FileText,
	History,
	Layers,
	MapPin,
	Palette,
	Settings,
	User,
} from "lucide-react";
import Link from "next/link";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

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

export default async function page({ params }: PageProps) {
	const { id: patientId } = await params;

	const patient = await api.dentist.patient.getById({ id: patientId });
	const dentalWorks = await api.dentist.dentalWork.getByPatientId({ patientId });

	// Kliniğe özel fiyatları getir
	const prosthesisTypeIds = [...new Set(dentalWorks.map((work) => work.prosthesisTypeId))];
	const clinicPrices =
		prosthesisTypeIds.length > 0
			? await api.dentist.dentalWork.getClinicPricesForProsthesisTypes({ prosthesisTypeIds })
			: {};

	// Tüm dental work'ler için aşama geçmişini al ve en son kim güncellemiş belirle
	const stageHistoriesMap = new Map<string, boolean>();
	const latestStageInfoMap = new Map<
		string,
		{ type: "prosthesis" | "technician"; name: string; updatedAt: Date }
	>();

	for (const dentalWork of dentalWorks) {
		try {
			const prosthesisHistory = await api.dentist.dentalWork.getStageHistory({ dentalWorkId: dentalWork.id });
			// Technician history is on the dentist router too
			let technicianHistory: any[] = [];
			try {
				technicianHistory = await api.dentist.dentalWork.getTechnicianStageHistory({ dentalWorkId: dentalWork.id });
			} catch {
				technicianHistory = [];
			}

			const totalHistoryCount = (prosthesisHistory?.length || 0) + (technicianHistory?.length || 0);
			stageHistoriesMap.set(dentalWork.id, totalHistoryCount > 0);

			// Combine histories and pick the latest by createdAt
			const combined = [
				...(prosthesisHistory || []).map((h: any) => ({ ...h, type: "prosthesis" })),
				...(technicianHistory || []).map((h: any) => ({ ...h, type: "technician" })),
			].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

			if (combined.length > 0) {
				const latest = combined[0];
				const name = latest.type === "prosthesis" ? latest.prosthesisStage?.name || "" : latest.technicianStage?.name || "";
				latestStageInfoMap.set(dentalWork.id, { type: latest.type, name, updatedAt: new Date(latest.createdAt) });
			} else {
				// Fallback - mevcut prosthesis stage
				latestStageInfoMap.set(dentalWork.id, {
					type: "prosthesis",
					name: dentalWork.prosthesisStage?.name || "",
					updatedAt: new Date(dentalWork.updatedAt),
				});
			}
		} catch {
			stageHistoriesMap.set(dentalWork.id, false);
			latestStageInfoMap.set(dentalWork.id, {
				type: "prosthesis",
				name: dentalWork.prosthesisStage?.name || "",
				updatedAt: new Date(dentalWork.updatedAt),
			});
		}
	}

	if (!patient) {
		return (
			<div className="space-y-5">
				<DashboardHeader title="Hasta Bulunamadı" />
				<div className="text-center py-8">
					<p className="text-muted-foreground">Bu hasta bulunamadı veya erişim yetkiniz yok.</p>
					<Link href="/hekim/hastalarim">
						<Button variant="outline" className="mt-4">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Geri Dön
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const groupedWorks = dentalWorks.reduce(
		(acc, work) => {
			const typeName = work.prosthesisType.name;
			const pricingType = work.prosthesisType.pricingType || "TOOTH_BASED";
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
				prosthesisType: (typeof dentalWorks)[0]["prosthesisType"];
				works: typeof dentalWorks;
				allTeeth: string[];
				allJaws: string[];
				pricingType: string;
				latestStage: string;
				latestProgress: number;
				toothColor: (typeof dentalWorks)[0]["toothColor"];
				notes: string[];
				createdAt: Date;
			}
		>,
	);

	const prosthesisTypes = Object.keys(groupedWorks);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<DashboardHeader
					title={
						<Link href="/hekim/hastalarim">
							<Button variant="outline">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Geri Dön
							</Button>
						</Link>
					}
				/>
			</div>

					<div className="flex flex-col gap-6 lg:grid lg:grid-cols-10">
						{/* Hasta Bilgileri ve Notları her zaman üstte */}
						<div className="order-1 lg:order-1 lg:col-span-3 space-y-5 lg:sticky lg:top-6 lg:self-start">
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
									{Object.entries(groupedWorks).length > 0 ? (
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

							{/* Bitim Yap Butonu */}
							<DentistPatientCompletion patient={patient} />
						</CardContent>
					</Card>

					<PatientNotesList patientId={patient.id} />
				</div>

	                    <div className="order-2 lg:order-2 lg:col-span-7">
					{prosthesisTypes.length === 0 ? (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Layers className="w-5 h-5 mr-2 text-blue-600" />
									Protez İşlemleri
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8 mb-6">
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
										<Layers className="w-8 h-8 text-muted-foreground" />
									</div>
									<p className="text-muted-foreground text-lg mb-4">Henüz protez işlemi bulunmuyor.</p>
								</div>
								<div className="max-w-md mx-auto">
									<AddDentistProsthesis patientId={patient.id} />
								</div>
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
										<TabsTrigger value="ek-tedaviler" className="flex-col gap-1 h-auto p-3">
											<div className="font-medium">Ek Tedaviler</div>
											<div className="text-xs text-muted-foreground">Tüm Ek Tedaviler</div>
										</TabsTrigger>
									</TabsList>
									{/* Ek Tedaviler Sekmesi */}
									<TabsContent value="ek-tedaviler" className="space-y-6">
										<div className="bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-200 rounded-lg p-4">
											<h4 className="font-semibold text-lg mb-4">Hastaya Eklenmiş Tüm Ek Tedaviler</h4>
											{(() => {
												// Tüm dentalWork'lardan ek tedavileri topla
												const allAdditionalTreatments = dentalWorks.flatMap(dw => (dw.dentalWorkAdditionalTreatments || []).map(add => ({
													...add,
													dentalWork: dw
												})));
												if (allAdditionalTreatments.length === 0) {
													return <div className="text-muted-foreground">Bu hastaya ek tedavi eklenmemiş.</div>;
												}
												return (
													<div className="space-y-3">
														{allAdditionalTreatments.map((add) => (
															<div key={add.id} className="p-3 border rounded bg-gray-50">
																<div className="flex justify-between items-center">
																	<span className="font-medium">{add.additionalTreatment?.name || 'Ek Tedavi'}</span>
																	<span className="text-xs text-gray-500">Adet: {add.quantity || 1}</span>
																</div>
																{add.price !== null && (
																	<div className="text-xs text-green-700">₺{add.price?.toLocaleString('tr-TR')}</div>
																)}
																{add.notes && (
																	<div className="text-xs text-gray-600 mt-1">Not: {add.notes}</div>
																)}
																<div className="text-xs text-gray-400 mt-1">Bağlı Protez: {add.dentalWork.prosthesisType?.name || '-'}</div>
															</div>
														))}
													</div>
												);
											})()}
										</div>
									</TabsContent>

									{prosthesisTypes.map((type) => {
										const group = groupedWorks[type];
										if (!group) return null;

										const uniqueTeeth = [...new Set(group.allTeeth)];
										const latestWork = group.works[0];
										if (!latestWork) return null;

										// Hasta bitimi yapıldıysa mevcut aşama 'Bitim Yapıldı' olarak göster
										const isPatientCompleted = patient.isCompleted;
										const latestStageForWork = latestStageInfoMap.get(latestWork.id);
										const currentStageName = isPatientCompleted
											? "Bitim Yapıldı"
											: (latestStageForWork?.name || group.latestStage);
										const stageColor = getStageColor(currentStageName);
										const stageIcon = getStageIcon(currentStageName);


										// Aşama geçmişi kontrolü
										const hasStageHistory = stageHistoriesMap.get(latestWork.id) || false;

										return (
											<TabsContent key={type} value={type} className="space-y-6">
												{/* Aşama Güncelleme Bölmesi - Soft Blue */}
												<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
													<UpdateStageForm
														dentalWorkId={latestWork.id}
														currentStageId={latestStageForWork?.type === 'prosthesis' ? (latestWork.prosthesisStageId || undefined) : undefined}
														currentStageName={currentStageName}
													/>
												</div>

												{/* Teslim Tarihi Güncelleme */}
												<UpdateDeliveryDateForm
													role="dentist"
													dentalWorkId={latestWork.id}
													currentDeliveryDate={latestWork.deliveryDate}
												/>

												{/* Ek Tedaviler - Readonly */}
												<AdditionalTreatmentListReadonly treatments={latestWork.dentalWorkAdditionalTreatments || []} />

												{/* Birleştirilmiş Bilgi Kutusu */}
												<div className="border rounded-lg p-4 bg-gradient-to-br from-emerald-50 via-purple-50 to-orange-50 space-y-4">
													{/* Üst: Protez ismi, başlangıç tarihi, aşama durumu */}
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-semibold text-lg flex items-center">
																{type}
															</h4>
															<p className="text-sm text-muted-foreground">
																{formatDate(group.createdAt)} tarihinde başlatıldı
															</p>
														</div>
														<div className="flex items-center gap-2">
															<div className={`w-3 h-3 rounded-full ${stageColor}`} />
															<Badge
																variant={
																	currentStageName === "Tamamlandı"
																		? "default"
																		: currentStageName === "İptal"
																			? "destructive"
																			: "secondary"
																}
																className="flex items-center gap-1"
															>
																{stageIcon}
																{currentStageName || "Aşama Belirtilmedi"}
															</Badge>
															{!hasStageHistory && (
																<EditProsthesisSheet dentalWorkId={latestWork.id}>
																	<Button variant="outline" size="sm">
																		<Edit className="w-4 h-4 mr-1" />
																		Düzenle
																	</Button>
																</EditProsthesisSheet>
															)}
														</div>
													</div>
													{/* Orta: İşlem İlerlemesi */}
													<div>
														<div className="flex justify-between items-center mb-2">
															<span className="text-sm font-medium">İşlem İlerlemesi</span>
															<span className="text-sm text-muted-foreground">{group.latestProgress}%</span>
														</div>
														<Progress value={group.latestProgress} className="h-2" />
													</div>
													{/* Alt: Detay Bilgileri */}
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

														{latestWork.deliveryDate && (
															<div className="flex items-center space-x-2">
																<CalendarClock className="w-4 h-4 text-muted-foreground" />
																<span className="font-medium">Teslim Tarihi:</span>
																<span className="text-muted-foreground">
																	{formatDateTime(latestWork.deliveryDate)}
																</span>
															</div>
														)}

														{(() => {
															// Kaydedilen fiyatı kullan (işlem oluşturulduğu zamanki fiyat)
															const savedUnitPrice = latestWork.unitPrice;
															const savedTotalPrice = latestWork.totalPrice;

															if (savedUnitPrice && savedTotalPrice) {
																return (
																	<div className="flex items-center space-x-2">
																		<span className="font-medium">Fiyat:</span>
																		<span className="text-muted-foreground font-semibold">
																			₺{Number(savedUnitPrice).toLocaleString("tr-TR")} / diş
																			<span className="text-xs text-gray-500 ml-1">
																				(Toplam: ₺{Number(savedTotalPrice).toLocaleString("tr-TR")})
																			</span>
																		</span>
																	</div>
																);
															}

															// Eğer kaydedilen fiyat yoksa eski sistemi kullan (geriye uyumluluk)
															const clinicPrice = clinicPrices[group.prosthesisType.id];
															const finalPrice = clinicPrice || group.prosthesisType.defaultPrice;
															return finalPrice ? (
																<div className="flex items-center space-x-2">
																	<span className="font-medium">Fiyat:</span>
																	<span className="text-muted-foreground font-semibold">
																		₺{finalPrice.toLocaleString("tr-TR")}
																		<span className="text-xs text-orange-600 ml-1">(Dinamik Fiyat)</span>
																	</span>
																</div>
															) : null;
														})()}
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

												{(() => {
													const work = latestWork as Record<string, unknown>;
													const attachments = work.attachments;

													if (Array.isArray(attachments) && attachments.length > 0) {
														const validAttachments = attachments.filter(
															(att): att is { url: string; name: string; type: "image" | "video" } =>
																typeof att === "object" &&
																att !== null &&
																"url" in att &&
																"name" in att &&
																"type" in att &&
																typeof (att as Record<string, unknown>).url === "string" &&
																typeof (att as Record<string, unknown>).name === "string" &&
																((att as Record<string, unknown>).type === "image" ||
																	(att as Record<string, unknown>).type === "video"),
														);

														if (validAttachments.length > 0) {
															return (
																<div className="border-t pt-4">
																	<AttachmentGallery attachments={validAttachments} compact={false} />
																</div>
															);
														}
													}
													return null;
												})()}

												<CombinedStageHistorySection works={group.works} />
											</TabsContent>
										);
									})}

									{/* Yeni Protez Ekleme Sekmesi */}
									<TabsContent value="yeni-protez" className="space-y-6">
										<div className="max-w-2xl">
											<div className="mb-6">
												<h3 className="text-lg font-semibold mb-2">Yeni Protez Ekle</h3>
												<p className="text-sm text-muted-foreground">
													Hastaya yeni bir protez işlemi ekleyin. Gerekli bilgileri doldurun.
												</p>
											</div>
											<AddDentistProsthesis patientId={patient.id} />
										</div>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

type DentalWork = {
	id: string;
	createdAt: Date;
};

const CombinedStageHistorySection = async ({ works }: { works: DentalWork[] }) => {
	try {
		// Hem prosthesis hem de technician stage history'lerini çek
		const allHistories = await Promise.all(
			works.map(async (work) => {
				try {
					// Prosthesis stage history
					const prosthesisHistory = await api.dentist.dentalWork.getStageHistory({ dentalWorkId: work.id });
					
					// Technician stage history
					const technicianHistory = await api.dentist.dentalWork.getTechnicianStageHistory({ dentalWorkId: work.id });
					
					// Prosthesis history'ye type ekle
					const prosthesisHistoryWithType = prosthesisHistory.map((h) => ({ 
						...h, 
						workId: work.id, 
						type: 'prosthesis' as const 
					}));
					
					// Technician history'ye type ekle
					const technicianHistoryWithType = technicianHistory.map((h) => ({ 
						...h, 
						workId: work.id, 
						type: 'technician' as const 
					}));
					
					return [...prosthesisHistoryWithType, ...technicianHistoryWithType];
				} catch {
					return [];
				}
			}),
		);

		const allHistory = allHistories
			.flat()
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		// Doktor sadece kendi eklediği en son doktor aşamasını geri alabilir
		// (teslim tarihi değişikliği kayıtları gerçek bir aşama olmadığı için hariç tutulur)
		const latestProsthesisEntryId = allHistory
			.filter((h: any) => h.type === "prosthesis" && !parseDeliveryDateNote(h.notes))
			.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.id;

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
						// Bitim kaydı: notes === 'BITIM_YAPILDI' ise, type ne olursa olsun
						const isBitimRecord = history.notes === "BITIM_YAPILDI";
						const isKuryeRecord = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI", "TEKRAR_DOKTORA_VERILDI"].includes(String(history.notes));
						const deliveryDateChange = parseDeliveryDateNote(history.notes);
						const isDeliveryDateRecord = !!deliveryDateChange;
						const stageName = isBitimRecord
							? "Bitim Yapıldı"
							: isKuryeRecord
								? "Kuryeye Verildi"
								: isDeliveryDateRecord
									? "Teslim Tarihi Değiştirildi"
									: (isProsthesis ? history.prosthesisStage?.name : history.technicianStage?.name);
						const bgColorClass = isBitimRecord
							? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
							: isKuryeRecord
								? "bg-gradient-to-r from-blue-50 to-cyan-50 border-cyan-200"
								: isDeliveryDateRecord
									? "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200"
									: (isProsthesis
										? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
										: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200");
						const iconColorClass = isBitimRecord
							? "border-green-500 bg-green-100"
							: isKuryeRecord
								? "border-cyan-500 bg-cyan-100"
								: isDeliveryDateRecord
									? "border-violet-500 bg-violet-100"
									: (isProsthesis ? "border-blue-500 bg-blue-100" : "border-orange-500 bg-orange-100");
						const iconClass = isBitimRecord
							? "text-green-600"
							: isKuryeRecord
								? "text-cyan-600"
								: isDeliveryDateRecord
									? "text-violet-600"
									: (isProsthesis ? "text-blue-600" : "text-orange-600");

						return (
							<div key={`${history.type}-${history.id}`} className="relative">
								<div className="flex items-start justify-center space-x-3">
									<div className={`flex-shrink-0 w-6 h-6 ${iconColorClass} border-2 rounded-full flex items-center justify-center`}>
										{index === 0 ? (
											<CheckCircle2 className={`w-3 h-3 ${iconClass}`} />
										) : (
											<div className={`w-2 h-2 rounded-full ${isBitimRecord ? 'bg-green-500' : isProsthesis ? 'bg-blue-500' : 'bg-orange-500'}`} />
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
																: isProsthesis
																	? 'bg-blue-100 text-blue-800'
																	: 'bg-orange-100 text-orange-800'
														}`}
													>
														{stageName}
													</Badge>
													<Badge variant="outline" className="text-xs">
														{isBitimRecord
															? 'Bitim Kaydı'
															: isKuryeRecord
																? 'Kurye Kaydı'
																: isDeliveryDateRecord
																	? 'Teslim Tarihi Kaydı'
																	: isProsthesis
																		? 'Doktor Aşaması'
																		: 'Teknisyen Aşaması'}
													</Badge>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-xs text-muted-foreground">
														{formatDateTime(history.createdAt, {
															day: "numeric",
															month: "short",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
													{isProsthesis && !isBitimRecord && !isDeliveryDateRecord && history.id === latestProsthesisEntryId && (
														<DeleteStageHistoryButton role="dentist" historyId={history.id} stageName={stageName} />
													)}
												</div>
											</div>

											{history.notes &&
												history.notes !== "BITIM_YAPILDI" &&
												history.notes !== "KURYEE_VERILDI" &&
												history.notes !== "TEKRAR_DOKTORA_VERILDI" &&
												!isDeliveryDateRecord && (
													<div className="mt-2">
														<div className="flex items-center text-xs text-muted-foreground mb-1">
															<FileText className="w-3 h-3 mr-1" />
															<span>Notlar</span>
														</div>
														<p className="text-xs bg-white/60 p-2 rounded border text-gray-700">{history.notes}</p>
													</div>
											)}
											{isDeliveryDateRecord && (
												<div className="mt-2">
													<div className="flex items-center text-xs text-muted-foreground mb-1">
														<CalendarClock className="w-3 h-3 mr-1 text-violet-600" />
														<span>Durum</span>
													</div>
													<p className="text-xs bg-violet-50 p-2 rounded border border-violet-200 text-violet-700">
														Teslim tarihi {formatDateTime(deliveryDateChange as Date)} olarak değiştirildi
													</p>
												</div>
											)}
											{isBitimRecord && (
												<div className="mt-2">
													<div className="flex items-center text-xs text-muted-foreground mb-1">
														<CheckCircle2 className="w-3 h-3 mr-1" />
														<span>Durum</span>
													</div>
													<p className="text-xs bg-green-50 p-2 rounded border border-green-200 text-green-700">
														{isProsthesis
															? 'Hasta bitimi doktor tarafından yapıldı'
															: 'Hasta bitimi teknisyen tarafından yapıldı'}
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
										isBitimRecord
											? 'from-green-300 to-green-200'
											: isProsthesis
												? 'from-blue-300 to-blue-200'
												: 'from-orange-300 to-orange-200'
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
	} catch {
		return (
			<div className="border-t pt-4">
				<h5 className="font-medium text-sm mb-2 flex items-center">
					<History className="w-4 h-4 mr-1" />
					İşlem Aşamaları
				</h5>
				<p className="text-sm text-red-500">Aşama geçmişi yüklenirken hata oluştu.</p>
			</div>
		);
	}
};
