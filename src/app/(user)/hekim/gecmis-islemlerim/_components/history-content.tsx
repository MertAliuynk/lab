import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, CheckCircle2, Clock, FileText, MapPin, Palette, User } from "lucide-react";
import { EmptyState } from "./empty-state";
import { HistoryPagination } from "./history-pagination";

interface HistoryContentProps {
	searchParams: {
		q?: string;
		status?: "all" | "ongoing" | "completed";
		startDate?: string;
		endDate?: string;
		prosthesisType?: string;
		stage?: string;
		page?: string;
		sort?: string;
	};
}

type DentalWork = RouterOutputs["dentist"]["dentalWork"]["getAll"][0];

export async function HistoryContent({ searchParams }: HistoryContentProps) {
	const page = Number.parseInt(searchParams.page || "1");
	const perPage = 12;

	try {
		// Tarih string'lerini local timezone'da Date objelerine dönüştür
		let startDateObj: Date | undefined;
		let endDateObj: Date | undefined;

		if (searchParams.startDate) {
			const dateParts = searchParams.startDate.split('-').map(Number);
			if (dateParts.length === 3 && dateParts.every(part => !isNaN(part))) {
				const year = dateParts[0]!;
				const month = dateParts[1]!;
				const day = dateParts[2]!;
				startDateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
			}
		}

		if (searchParams.endDate) {
			const dateParts = searchParams.endDate.split('-').map(Number);
			if (dateParts.length === 3 && dateParts.every(part => !isNaN(part))) {
				const year = dateParts[0]!;
				const month = dateParts[1]!;
				const day = dateParts[2]!;
				endDateObj = new Date(year, month - 1, day, 23, 59, 59, 999);
			}
		}

		const dentalWorks = await api.dentist.dentalWork.getAll({
			startDate: startDateObj,
			endDate: endDateObj,
			page,
			perPage,
		});

		let filteredWorks = [...dentalWorks];

		if (searchParams.q?.trim()) {
			const searchQuery = searchParams.q.toLowerCase().trim();
			filteredWorks = filteredWorks.filter(
				(work) =>
					work.patient.name.toLowerCase().includes(searchQuery) ||
					work.prosthesisType.name.toLowerCase().includes(searchQuery) ||
					work.prosthesisStage?.name.toLowerCase().includes(searchQuery) ||
					work.toothColor?.name.toLowerCase().includes(searchQuery) ||
					work.notes?.toLowerCase().includes(searchQuery),
			);
		}

		if (searchParams.status && searchParams.status !== "all") {
			filteredWorks = filteredWorks.filter((work) => {
				const isCompleted = work.isCompleted === true;
				const progress = work.prosthesisStage?.percentage || 0;
				if (searchParams.status === "completed") {
					return isCompleted || progress === 100;
				}
				if (searchParams.status === "ongoing") {
					return !isCompleted && progress < 100;
				}
				return true;
			});
		}

		if (searchParams.sort) {
			filteredWorks.sort((a, b) => {
				switch (searchParams.sort) {
					case "createdAt-asc":
						return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					case "createdAt-desc":
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
					case "patient-asc":
						return a.patient.name.localeCompare(b.patient.name, "tr");
					case "patient-desc":
						return b.patient.name.localeCompare(a.patient.name, "tr");
					default:
						return 0;
				}
			});
		}

		const totalPages = Math.ceil(filteredWorks.length / perPage);
		const currentPageWorks = filteredWorks.slice((page - 1) * perPage, page * perPage);

		if (currentPageWorks.length === 0) {
			return <EmptyState searchParams={searchParams} />;
		}

		   // Tüm işlemler (protez ve ek tedaviler) tek listede gösterilecek
		   return (
			   <div className="space-y-6">
				   <Card>
					   <CardContent className="p-4">
						   <h2 className="font-bold text-lg mb-2">Tüm İşlemler</h2>
						   {currentPageWorks.length === 0 ? (
							   <p className="text-muted-foreground">İşlem yok.</p>
						   ) : (
							   currentPageWorks.map((work) => (
								   <div key={work.id} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0">
									   <DentalWorkListItem work={work} />
									   {work.dentalWorkAdditionalTreatments?.length > 0 && (
										   <div className="mt-2 ml-4 space-y-2">
											   {work.dentalWorkAdditionalTreatments.map((add) => (
												   <div key={add.id} className="p-2 border rounded bg-gray-50">
													   <div className="flex justify-between items-center">
														   <span className="font-medium">{add.additionalTreatment?.name || 'Ek Tedavi'}</span>
														   <span className="text-xs text-gray-500">Adet: {add.quantity || 1}</span>
													   </div>
													   {add.price !== null && (
														   <div className="text-xs text-green-700">₺{add.price?.toLocaleString('tr-TR')}</div>
													   )}
												   </div>
											   ))}
										   </div>
									   )}
								   </div>
							   ))
						   )}
					   </CardContent>
				   </Card>
				   <HistoryPagination currentPage={page} totalPages={totalPages} searchParams={searchParams} />
			   </div>
		   );
	} catch (error) {
		console.error("Error fetching dental works:", error);
		return <EmptyState searchParams={searchParams} />;
	}
}

function DentalWorkListItem({ work }: { work: DentalWork }) {
			// Eğer iş tamamlandıysa, yüzde ve durum kesin olarak 100 ve 'Tamamlandı' olmalı
			const isCompleted = work.isCompleted === true;
			const progress = isCompleted ? 100 : (work.prosthesisStage?.percentage || 0);
	// Toplam fiyat: protez + ek tedaviler (her durumda)
	let totalPrice = work.totalPrice ? Number(work.totalPrice) : 0;
	if (work.dentalWorkAdditionalTreatments?.length) {
		const ekTedaviToplam = work.dentalWorkAdditionalTreatments.reduce((sum, add) => {
			const price = Number(add.price) || 0;
			return sum + price;
		}, 0);
		totalPrice += ekTedaviToplam;
	}

	return (
		<Card className="hover:shadow-sm transition-shadow">
			<CardContent className="p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					{/* Hasta ve Protez Bilgileri */}
					<div className="flex items-center gap-3 flex-1">
						<User className="h-5 w-5 text-gray-400 flex-shrink-0" />
						<div className="min-w-0 flex-1">
							<h3 className="font-semibold text-sm sm:text-base truncate">{work.patient.name}</h3>
							<p className="text-xs sm:text-sm text-gray-500 truncate">{work.prosthesisType.name}</p>
						</div>
					</div>

					{/* Detay Bilgileri - Mobile'da alt satıra geçer */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
						<div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
							<div className="flex items-center gap-1">
								<MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
								<span className="truncate">Diş: {work.selectedTeeth.join(", ")}</span>
							</div>

							{work.toothColor && (
								<div className="flex items-center gap-1">
									<Palette className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
									<span className="truncate">{work.toothColor.name}</span>
								</div>
							)}

							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
								<span>{format(work.createdAt, "dd.MM.yyyy", { locale: tr })}</span>
							</div>
						</div>

						{/* Progress ve Durum */}
						<div className="flex items-center justify-between sm:justify-end gap-4">
							<div className="text-left sm:text-right">
								<div className="flex items-center gap-2 mb-1">
									{isCompleted ? (
										<CheckCircle2 className="h-4 w-4 text-green-500" />
									) : (
										<Clock className="h-4 w-4 text-yellow-500" />
									)}
									<span className="text-sm font-medium">{isCompleted ? 100 : progress}%</span>
								</div>
								<Progress value={isCompleted ? 100 : progress} className="h-1.5 w-16 sm:w-20" color={isCompleted ? "green" : "primary"} />
								{work.prosthesisStage && <p className="text-xs text-gray-500 mt-1">{work.prosthesisStage.name}</p>}
							</div>

							{/* Fiyat ve Badge */}
							<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
								{totalPrice > 0 && (
									<div className="text-right">
										<p className="text-xs text-gray-500">Toplam</p>
										<p className="text-sm font-semibold text-green-600">₺{totalPrice.toLocaleString("tr-TR")}</p>
									</div>
								)}

								<Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
									{isCompleted ? "Tamamlandı" : "Devam Ediyor"}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				{work.notes && !["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI", "BITIM_YAPILDI"].includes(work.notes) && (
					<div className="mt-4 pt-4 border-t">
						<div className="flex items-start gap-2 text-sm">
							<FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
							<p className="text-gray-600 break-words">{work.notes}</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
