import { api } from "@/trpc/server";
import { Activity, CheckCircle2, Clock, DollarSign } from "lucide-react";

interface HistoryHeaderProps {
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

export async function HistoryHeader({ searchParams }: HistoryHeaderProps) {
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
		page: 1,
		perPage: 1000,
		startDate: startDateObj,
		endDate: endDateObj,
	});

	const stats = {
		total: dentalWorks.length,
		completed: dentalWorks.filter((work) => work.isCompleted === true).length,
		ongoing: dentalWorks.filter((work) => work.isCompleted !== true).length,
		totalCost: dentalWorks
			.filter((work) => work.isCompleted)
			.reduce((sum, work) => {
				// Protez fiyatı
				let total = Number(work.totalPrice || work.unitPrice || 0);
				// Ek tedavi fiyatları (adet ile çarpılır)
				if (work.dentalWorkAdditionalTreatments?.length) {
					total += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
						const price = Number(add.price) || 0;
						const quantity = add.quantity || 1;
						return addSum + price * quantity;
					}, 0);
				}
				return sum + total;
			}, 0),
	};

	return (
		<div className="space-y-6">
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-lg font-semibold text-gray-700 mb-2">İşlem Özeti</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-3">
									<Activity className="h-5 w-5 text-white" />
								</div>
								<div className="text-3xl font-bold text-blue-700 mb-1">{stats.total}</div>
								<div className="text-sm text-blue-600 font-medium">Toplam İşlem</div>
								<div className="w-full h-1 bg-blue-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-3">
									<CheckCircle2 className="h-5 w-5 text-white" />
								</div>
								<div className="text-3xl font-bold text-green-700 mb-1">{stats.completed}</div>
								<div className="text-sm text-green-600 font-medium">Tamamlanan</div>
								<div className="w-full h-1 bg-green-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mb-3">
									<Clock className="h-5 w-5 text-white" />
								</div>
								<div className="text-3xl font-bold text-orange-700 mb-1">{stats.ongoing}</div>
								<div className="text-sm text-orange-600 font-medium">Devam Eden</div>
								<div className="w-full h-1 bg-orange-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-3">
									<DollarSign className="h-5 w-5 text-white" />
								</div>
								<div className="text-3xl font-bold text-purple-700 mb-1">{stats.totalCost.toLocaleString('tr-TR')} ₺</div>
								<div className="text-sm text-purple-600 font-medium">Toplam Protez Maliyeti</div>
								<div className="w-full h-1 bg-purple-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
