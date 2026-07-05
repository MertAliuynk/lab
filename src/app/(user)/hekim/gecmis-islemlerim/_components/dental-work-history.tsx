"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/server";
import { Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useState } from "react";
import { DateFilter } from "./date-filter";
import { DentalWorkCard } from "./dental-work-card";

interface DentalWorkHistoryProps {
	search: string;
	startDate: string;
	endDate: string;
	showFilters: string;
	status: "all" | "ongoing" | "completed";
}

export async function DentalWorkHistory({ search, startDate, endDate, showFilters, status }: DentalWorkHistoryProps) {
	const dentalWorks = await api.dentist.dentalWork.getAll({
		page: 1,
		perPage: 50,
		startDate: startDate ? new Date(startDate) : undefined,
		endDate: endDate ? new Date(endDate) : undefined,
	});

	const filteredDentalWorks = search
		? dentalWorks.filter(
				(work) =>
					work.patient.name.toLowerCase().includes(search.toLowerCase()) ||
					work.prosthesisType.name.toLowerCase().includes(search.toLowerCase()) ||
					work.prosthesisStage?.name.toLowerCase().includes(search.toLowerCase()) ||
					work.toothColor?.name.toLowerCase().includes(search.toLowerCase()) ||
					work.notes?.toLowerCase().includes(search.toLowerCase()),
			)
		: dentalWorks;

	const statusFilteredDentalWorks =
		status === "all"
			? filteredDentalWorks
			: status === "completed"
				? filteredDentalWorks.filter((work) => work.prosthesisStage?.percentage === 100)
				: filteredDentalWorks.filter((work) => work.prosthesisStage?.percentage !== 100);

	return (
		<div className="space-y-6">
			<ClientFilters
				search={search}
				startDate={startDate}
				endDate={endDate}
				showFilters={showFilters}
				status={status}
			/>

			{statusFilteredDentalWorks && statusFilteredDentalWorks.length > 0 ? (
				<div className="space-y-4">
					{statusFilteredDentalWorks.map((dentalWork) => (
						<DentalWorkCard
							key={dentalWork.id}
							dentalWork={{
								...dentalWork,
								unitPrice: dentalWork.unitPrice ? Number(dentalWork.unitPrice) : null,
								totalPrice: dentalWork.totalPrice ? Number(dentalWork.totalPrice) : null,
								attachments: Array.isArray(dentalWork.attachments)
									? (dentalWork.attachments as Array<{ url: string; name: string; type: "image" | "video" }>)
									: null,
							}}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<Search className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{search || startDate || endDate ? "Hiç işlem bulunamadı" : "Henüz işlem kaydı yok"}
					</h3>
					<p className="text-gray-600 max-w-md mx-auto">
						{search || startDate || endDate
							? "Arama kriterlerinize uygun işlem bulunamadı. Filtreleri değiştirin."
							: "Dental işlemleriniz burada görüntülenecek. İlk işleminizi oluşturmak için hastalarınız sayfasına gidin."}
					</p>
				</div>
			)}
		</div>
	);
}

function ClientFilters({ search, startDate, endDate, showFilters, status }: DentalWorkHistoryProps) {
	"use client";
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();
	const [inputValue, setInputValue] = useState(search);

	const handleParam = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		startTransition(() => {
			router.replace(`?${params.toString()}`);
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="flex items-center gap-2">
					<h2 className="text-lg font-semibold">
						Toplam{" "}
						{searchParams.get("status") === "all" || !searchParams.get("status")
							? ""
							: searchParams.get("status") === "completed"
								? "Tamamlanan"
								: "Devam Eden"}{" "}
						işlem
					</h2>
					<Select value={status} onValueChange={(v) => handleParam("status", v)}>
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tümü</SelectItem>
							<SelectItem value="ongoing">Devam Edenler</SelectItem>
							<SelectItem value="completed">Tamamlananlar</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button
					variant="outline"
					onClick={() => handleParam("showFilters", showFilters === "true" ? "false" : "true")}
					className="flex items-center gap-2"
				>
					<Filter className="h-4 w-4" />
					Filtreler
				</Button>
			</div>

			<div className="relative">
				<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
					<Search className="h-4 w-4" />
					<span className="text-sm">Ara:</span>
				</div>
				<Input
					prefix={<Search size={16} className="text-muted-foreground" />}
					placeholder="Hasta adı, protez türü, aşama veya notlarda ara..."
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						handleParam("search", e.target.value);
					}}
				/>
			</div>

			{showFilters === "true" && (
				<div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
					<div className="flex items-center justify-between">
						<h3 className="font-medium">Tarih Filtreleri</h3>
						{(startDate || endDate || search) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									handleParam("search", "");
									handleParam("startDate", "");
									handleParam("endDate", "");
									handleParam("showFilters", "false");
								}}
							>
								Tümünü Temizle
							</Button>
						)}
					</div>

					<DateFilter
						startDate={startDate ? new Date(startDate) : undefined}
						endDate={endDate ? new Date(endDate) : undefined}
						onStartDateChange={(date) => handleParam("startDate", date ? date.toISOString() : "")}
						onEndDateChange={(date) => handleParam("endDate", date ? date.toISOString() : "")}
						onClear={() => {
							handleParam("startDate", "");
							handleParam("endDate", "");
						}}
					/>
				</div>
			)}
		</div>
	);
}
