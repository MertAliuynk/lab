import DashboardHeader from "@/components/dashboard-header";
import EditProsthesisSheet from "@/components/edit-prosthesis-sheet";
import PatientNotesList from "@/components/patient-notes-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdateStageForm from "@/components/update-stage-form";
import { api } from "@/trpc/server";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Edit,
	Layers,
	MapPin,
	Palette,
	Settings,
	User,
} from "lucide-react";
import Link from "next/link";
import { AdminStageHistoryClient } from "./_components/admin-stage-history-client";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

type GroupedWork = {
	prosthesisType: {
		id: string;
		name: string;
		defaultPrice: number | null;
	};
	works: Array<{
		id: string;
		prosthesisTypeId: string;
		prosthesisStageId?: string | null;
		prosthesisStage: {
			id: string;
			name: string;
			percentage: number;
		} | null;
		selectedTeeth: string[] | null;
		notes: string | null;
		createdAt: Date;
		unitPrice: unknown;
		totalPrice: unknown;
		attachments?: unknown;
		toothColor: {
			name: string;
		} | null;
	}>;
	allTeeth: string[];
	latestStage: string;
	latestProgress: number;
	toothColor: {
		name: string;
	} | null;
	notes: string[];
	createdAt: Date;
};

type GroupedWorks = Record<string, GroupedWork>;

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

export default async function AdminPatientDetailPage({ params }: PageProps) {
	const { id: patientId } = await params;

	try {
		const patient = await api.admin.patient.getById({ id: patientId });
		const dentalWorks = await api.admin.dentalWork.getByPatientId({ patientId });

		const prosthesisTypeIds = [...new Set(dentalWorks.map((work) => work.prosthesisTypeId))];
		const clinicPrices =
			prosthesisTypeIds.length > 0
				? await api.admin.dentalWork.getClinicPricesForProsthesisTypes({ prosthesisTypeIds })
				: {};

		const stageHistoriesMap = new Map<string, boolean>();
		for (const dentalWork of dentalWorks) {
			try {
				const history = await api.admin.dentalWork.getStageHistory({ dentalWorkId: dentalWork.id });
				stageHistoriesMap.set(dentalWork.id, history.length > 0);
			} catch {
				stageHistoriesMap.set(dentalWork.id, false);
			}
		}

		const groupedWorks = dentalWorks.reduce((acc, work) => {
			const typeName = work.prosthesisType.name;
			if (!acc[typeName]) {
				acc[typeName] = {
					prosthesisType: {
						id: work.prosthesisType.id,
						name: work.prosthesisType.name,
						defaultPrice: work.prosthesisType.defaultPrice,
					},
					works: [],
					allTeeth: [],
					latestStage: work.prosthesisStage?.name || "",
					latestProgress: 0,
					toothColor: work.toothColor,
					notes: [],
					createdAt: work.createdAt,
				};
			}

			const currentGroup = acc[typeName];
			if (currentGroup) {
				currentGroup.works.push(work);
				currentGroup.allTeeth.push(...(work.selectedTeeth || []));

				const workProgress = getStageProgress(work.prosthesisStage?.percentage);
				if (workProgress > currentGroup.latestProgress) {
					currentGroup.latestStage = work.prosthesisStage?.name || "";
					currentGroup.latestProgress = workProgress;
				}

				if (work.notes) {
					currentGroup.notes.push(work.notes);
				}

				if (work.createdAt < currentGroup.createdAt) {
					currentGroup.createdAt = work.createdAt;
				}
			}

			return acc;
		}, {} as GroupedWorks);

		const prosthesisTypes = Object.keys(groupedWorks);

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<DashboardHeader
						title={
							<Link href="/admin/patient">
								<Button variant="outline">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Geri Dön
								</Button>
							</Link>
						}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
					<div className="lg:col-span-3 space-y-5 sticky top-6 self-start">
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center text-lg">
									<User className="w-5 h-5 mr-2 text-blue-600" />
									Hasta Bilgileri
									<Badge variant="destructive" className="ml-2 text-xs">
										Admin
									</Badge>
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
										<span>Kayıt: {new Date(patient.createdAt).toLocaleDateString("tr-TR")}</span>
									</div>

									<div className="flex items-center text-sm">
										<User className="w-4 h-4 mr-2 text-muted-foreground" />
										<span>Hekim: {patient.dentist.user.name}</span>
									</div>

									<div className="flex items-center text-sm">
										<MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
										<span>Klinik: {patient.clinic.name}</span>
									</div>

									<div className="space-y-2">
										{Object.entries(groupedWorks).length > 0 ? (
											Object.entries(groupedWorks).map(([typeName, group]: [string, GroupedWork]) => {
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
							</CardContent>
						</Card>

						<PatientNotesList patientId={patient.id} />
					</div>

					<div className="lg:col-span-7">
						{prosthesisTypes.length === 0 ? (
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
										<Badge variant="destructive" className="ml-2">
											Admin Yetkileri
										</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue={prosthesisTypes[0]} className="space-y-6">
										<TabsList className="h-auto p-1">
											{prosthesisTypes.map((type) => {
												const group = groupedWorks[type];
												if (!group) return null;
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
													<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
														<UpdateStageForm
															dentalWorkId={latestWork.id}
															currentStageId={latestWork.prosthesisStage?.id || undefined}
															isAdmin={true}
														/>
														<div className="space-y-4">
															<div className="flex justify-between items-start">
																<div>
																	<h4 className="font-semibold text-lg flex items-center">
																		{type}
																		<Badge variant="outline" className="ml-2 text-xs">
																			#{latestWork.id.slice(-6)}
																		</Badge>
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
															<EditProsthesisSheet dentalWorkId={latestWork.id} isAdmin={true}>
																<Button variant="outline" size="sm" className="w-full">
																	<Edit className="w-4 h-4 mr-1" />
																	Düzenle (Admin)
																</Button>
															</EditProsthesisSheet>
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
																	.map((t: string) => Number(t))
																	.sort((a: number, b: number) => a - b)
																	.join(", ")}{" "}
																({uniqueTeeth.length} diş)
															</span>
														</div>

														{(() => {
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

													{group.notes.length > 0 && (
														<div className="border-t pt-4">
															<h5 className="font-medium text-sm mb-2 flex items-center">
																<Settings className="w-4 h-4 mr-1" />
																İşlem Notları
															</h5>
															<div className="space-y-2">
																{group.notes.map((note: string, noteIndex: number) => (
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

													<AdminStageHistoryClient dentalWorkId={latestWork.id} />
												</TabsContent>
											);
										})}
									</Tabs>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		);
	} catch (_error) {
		return (
			<div className="space-y-5">
				<DashboardHeader title="Hasta Bulunamadı" />
				<div className="text-center py-8">
					<p className="text-muted-foreground">Bu hasta bulunamadı veya erişim yetkiniz yok.</p>
					<Link href="/admin/patient">
						<Button variant="outline" className="mt-4">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Geri Dön
						</Button>
					</Link>
				</div>
			</div>
		);
	}
}
