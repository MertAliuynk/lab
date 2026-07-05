"use client";

import { api } from "@/trpc/react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { PatientList } from "./patient-list";
import { SearchFilter } from "./search-filter";

export function PatientListContainer() {
	const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("ongoing");
	const [locationFilter, setLocationFilter] = useState<"all" | "at_doctor" | "at_technician">("all");

	const { data: patients = [], isLoading } = api.dentist.patient.getMy.useQuery({
		name: searchQuery || undefined,
	});

	const handleStatusChange = (status: "all" | "ongoing" | "completed") => {
		setStatusFilter(status);
	};

	const handleLocationChange = (location: "all" | "at_doctor" | "at_technician") => {
		setLocationFilter(location);
	};

	const handleSearchChange = (search: string) => {
		setSearchQuery(search);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="w-80 h-10 bg-gray-200 animate-pulse rounded-md" />
				</div>

				<div className="relative mb-8 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl" />
					<div className="relative p-8">
						<div className="text-center mb-6">
							<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto" />
						</div>

						<div className="flex flex-col md:flex-row items-center justify-center gap-8">
							{Array.from({ length: 3 }, (_, i) => (
								<div key={i} className="group relative">
									<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full opacity-20 blur-xl" />
									<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg">
										<div className="w-16 h-16 bg-gray-300 animate-pulse rounded-full mx-auto mb-4" />
										<div className="w-16 h-8 bg-gray-300 animate-pulse rounded mx-auto mb-1" />
										<div className="w-24 h-4 bg-gray-300 animate-pulse rounded mx-auto" />
										<div className="w-full h-1 bg-blue-200 rounded-full mt-3" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }, (_, i) => (
						<div key={`patient-loading-${i}`} className="animate-pulse border rounded-lg">
							<div className="p-6 pb-3">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-gray-300 rounded-full" />
									<div className="space-y-2">
										<div className="h-4 bg-gray-300 rounded w-32" />
										<div className="h-3 bg-gray-300 rounded w-24" />
									</div>
								</div>
							</div>
							<div className="p-6 pt-0 space-y-4">
								<div className="h-3 bg-gray-300 rounded w-full" />
								<div className="h-3 bg-gray-300 rounded w-3/4" />
								<div className="h-3 bg-gray-300 rounded w-1/2" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<SearchFilter 
				onStatusChange={handleStatusChange} 
				onLocationChange={handleLocationChange} 
				onSearchChange={handleSearchChange} 
				patients={patients}
				statusFilter={statusFilter}
				locationFilter={locationFilter}
				searchQuery={searchQuery}
			/>
			<PatientList patients={patients} searchQuery={searchQuery || ""} statusFilter={statusFilter} locationFilter={locationFilter} />
		</>
	);
}
