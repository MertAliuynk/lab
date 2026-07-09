"use client";

import DashboardHeader from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Calendar, Search, Users } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

type SearchFilterProps = {
	onStatusChange: (status: "all" | "ongoing" | "completed") => void;
	onLocationChange: (location: "all" | "at_doctor" | "at_technician") => void;
	onSearchChange?: (search: string) => void;
	patients?: any[];
	statusFilter: "all" | "ongoing" | "completed";
	locationFilter: "all" | "at_doctor" | "at_technician";
	searchQuery: string;
};

export function SearchFilter({
	onStatusChange,
	onLocationChange,
	onSearchChange,
	patients = [],
	statusFilter,
	locationFilter,
	searchQuery
}: SearchFilterProps) {
	const [, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [inputValue, setInputValue] = useState(searchQuery);

	const debouncedSearch = useDebouncedCallback((value: string) => {
		setSearchQuery(value);
		onSearchChange?.(value);
	}, 500);

	const handleSearchChange = (value: string) => {
		setInputValue(value);
		debouncedSearch(value);
	};

	const handleStatusChange = (value: "all" | "ongoing" | "completed") => {
		onStatusChange(value);
	};

	const handleLocationChange = (value: "all" | "at_doctor" | "at_technician") => {
		onLocationChange(value);
	};

	useEffect(() => {
		if (searchQuery !== inputValue) {
			setInputValue(searchQuery);
		}
	}, [searchQuery]);



	// İstatistikleri hesapla
	const allDentalWorks = patients.flatMap(patient => patient.dentalWorks || []);
	const totalPatients = patients.length;
	const totalDentalWorks = allDentalWorks.length;

	// Manuel bitim kontrolü ile tamamlanan işleri say
	const completedPatients = patients.filter(patient => patient.isCompleted).length;
	const pendingPatients = totalPatients - completedPatients;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<DashboardHeader title="Hastalarım" />
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Hasta ara..."
							className="w-full sm:w-64 pl-9"
							value={inputValue}
							onChange={(e) => handleSearchChange(e.target.value)}
						/>
					</div>
					<div className="flex flex-col sm:flex-row gap-2">
						<Select value={statusFilter} onValueChange={handleStatusChange}>
							<SelectTrigger className="w-full sm:w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tümü</SelectItem>
								<SelectItem value="ongoing">Devam Edenler</SelectItem>
								<SelectItem value="completed">Tamamlananlar</SelectItem>
							</SelectContent>
						</Select>
						<Select value={locationFilter} onValueChange={handleLocationChange}>
							<SelectTrigger className="w-full sm:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tüm Hastalar</SelectItem>
								<SelectItem value="at_doctor">Doktorda Olan</SelectItem>
								<SelectItem value="at_technician">Teknisyende Olan</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Users className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-blue-700 mb-1">{totalPatients}</div>
								<div className="text-sm text-blue-600 font-medium">Hasta</div>
								<div className="w-full h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mt-3" />
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-blue-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Calendar className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-emerald-700 mb-1">{completedPatients}</div>
								<div className="text-sm text-emerald-600 font-medium">Tamamlanan</div>
								<div className="w-full h-1 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full mt-3" />
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-emerald-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Users className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-orange-700 mb-1">{pendingPatients}</div>
								<div className="text-sm text-orange-600 font-medium">Devam Eden</div>
								<div className="w-full h-1 bg-gradient-to-r from-orange-200 to-red-200 rounded-full mt-3" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
