"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown, Filter, RotateCcw, Search, SortAsc, X } from "lucide-react";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

interface HistoryFiltersProps {
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

const quickDateRanges = [
	{ label: "Bugün", days: 0 },
	{ label: "Bu Hafta", days: 7 },
	{ label: "Bu Ay", days: 30 },
	{ label: "Son 3 Ay", days: 90 },
];

const sortOptions = [
	{ value: "createdAt-desc", label: "En Yeni" },
	{ value: "createdAt-asc", label: "En Eski" },
	{ value: "patient-asc", label: "Hasta Adı (A-Z)" },
	{ value: "patient-desc", label: "Hasta Adı (Z-A)" },
];

export function HistoryFilters({ searchParams }: HistoryFiltersProps) {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);
	const [searchInput, setSearchInput] = useState(searchParams.q || "");

	const [search, setSearch] = useQueryState("q", parseAsString.withDefault("").withOptions({ shallow: false }));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsStringEnum(["all", "ongoing", "completed"]).withDefault("all").withOptions({ shallow: false }),
	);
	const [startDate, setStartDate] = useQueryState(
		"startDate",
		parseAsString.withDefault("").withOptions({ shallow: false }),
	);
	const [endDate, setEndDate] = useQueryState("endDate", parseAsString.withDefault("").withOptions({ shallow: false }));

	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("createdAt-desc").withOptions({ shallow: false }),
	);
	const [_page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: false }));

	const debouncedSearch = useDebouncedCallback((value: string) => {
		void setSearch(value);
		void setPage(1);
	}, 500);

	const handleSearchInput = (value: string) => {
		setSearchInput(value);
		debouncedSearch(value);
	};

	const handleQuickDate = (days: number) => {
		const now = new Date();
		const start = new Date(now);

		if (days === 0) {
			start.setHours(0, 0, 0, 0);
		} else {
			start.setDate(now.getDate() - days);
		}

		// Local timezone'da tarih formatla
		const startYear = start.getFullYear();
		const startMonth = String(start.getMonth() + 1).padStart(2, '0');
		const startDay = String(start.getDate()).padStart(2, '0');
		const startDateStr = `${startYear}-${startMonth}-${startDay}`;

		const endYear = now.getFullYear();
		const endMonth = String(now.getMonth() + 1).padStart(2, '0');
		const endDay = String(now.getDate()).padStart(2, '0');
		const endDateStr = `${endYear}-${endMonth}-${endDay}`;

		if (startDateStr) void setStartDate(startDateStr);
		if (endDateStr) void setEndDate(endDateStr);
		void setPage(1);
	};

	const handleClearFilters = () => {
		setSearchInput("");
		void setSearch("");
		void setStatus("all");
		void setStartDate("");
		void setEndDate("");
		void setSort("createdAt-desc");
		void setPage(1);
	};

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	const activeFiltersCount = [search, status !== "all" ? status : null, startDate, endDate].filter(Boolean).length;

	const startDateObj = startDate ? new Date(startDate) : undefined;
	const endDateObj = endDate ? new Date(endDate) : undefined;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center gap-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							prefix={<Search className="h-4 w-4 text-muted-foreground" />}
							placeholder="Hasta adı, protez türü veya notlarda ara..."
							value={searchInput}
							onChange={(e) => handleSearchInput(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-2">
						<Select
							value={status}
							onValueChange={(value: "all" | "ongoing" | "completed") => {
								void setStatus(value);
								void setPage(1);
							}}
						>
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tümü</SelectItem>
								<SelectItem value="ongoing">Devam Eden</SelectItem>
								<SelectItem value="completed">Tamamlanan</SelectItem>
							</SelectContent>
						</Select>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setFiltersOpen(!filtersOpen)}
							className={cn("relative", activeFiltersCount > 0 && "border-blue-500 bg-blue-50")}
						>
							<Filter className="h-4 w-4" />
							Filtreler
							{activeFiltersCount > 0 && (
								<Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
									{activeFiltersCount}
								</Badge>
							)}
							<ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger className="w-40">
							<SortAsc className="h-4 w-4" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
				<CollapsibleContent className="space-y-4">
					<div className="rounded-lg border p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium">Gelişmiş Filtreler</h3>
							{activeFiltersCount > 0 && (
								<Button variant="ghost" size="sm" onClick={handleClearFilters}>
									<RotateCcw className="h-4 w-4 mr-1" />
									Temizle
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div className="space-y-2">
								<span className="text-sm font-medium">Hızlı Tarih</span>
								<div className="flex flex-wrap gap-2">
									{quickDateRanges.map((range) => (
										<Button
											key={range.label}
											variant="outline"
											size="sm"
											onClick={() => handleQuickDate(range.days)}
											className="text-xs"
										>
											{range.label}
										</Button>
									))}
								</div>
							</div>

							<div className="flex gap-5 w-full">
								<div className="space-y-2 w-full">
									<div className="text-sm font-medium">Başlangıç Tarihi</div>
									<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"justify-start text-left font-normal w-full",
													!startDateObj && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{startDateObj ? format(startDateObj, "dd.MM.yyyy", { locale: tr }) : "Seçiniz"}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={startDateObj}
												onSelect={(date) => {
													if (date) {
														// Local timezone'da tarih formatla
														const year = date.getFullYear();
														const month = String(date.getMonth() + 1).padStart(2, '0');
														const day = String(date.getDate()).padStart(2, '0');
														const dateStr = `${year}-${month}-${day}`;
														void setStartDate(dateStr);
													} else {
														void setStartDate(null);
													}
													setStartDateOpen(false);
													void setPage(1);
												}}
												initialFocus
												locale={tr}
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className="space-y-2 w-full">
									<div className="text-sm font-medium">Bitiş Tarihi</div>
									<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"justify-start text-left font-normal w-full",
													!endDateObj && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{endDateObj ? format(endDateObj, "dd.MM.yyyy", { locale: tr }) : "Seçiniz"}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={endDateObj}
												onSelect={(date) => {
													if (date) {
														// Local timezone'da tarih formatla
														const year = date.getFullYear();
														const month = String(date.getMonth() + 1).padStart(2, '0');
														const day = String(date.getDate()).padStart(2, '0');
														const dateStr = `${year}-${month}-${day}`;
														void setEndDate(dateStr);
													} else {
														void setEndDate(null);
													}
													setEndDateOpen(false);
													void setPage(1);
												}}
												initialFocus
												locale={tr}
												disabled={(date) => (startDateObj ? date < startDateObj : false)}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							<div className="space-y-2">
								<span className="text-sm font-medium">Aktif Filtreler</span>
								<div className="flex flex-wrap gap-1">
									{search && (
										<Badge variant="secondary" className="text-xs">
											Arama: {search}
											<X
												className="ml-1 h-3 w-3 cursor-pointer"
												onClick={() => {
													setSearchInput("");
													void setSearch("");
													void setPage(1);
												}}
											/>
										</Badge>
									)}
									{status !== "all" && (
										<Badge variant="secondary" className="text-xs">
											Durum: {status === "ongoing" ? "Devam Eden" : "Tamamlanan"}
											<X
												className="ml-1 h-3 w-3 cursor-pointer"
												onClick={() => {
													void setStatus("all");
													void setPage(1);
												}}
											/>
										</Badge>
									)}
									{(startDate || endDate) && (
										<Badge variant="secondary" className="text-xs">
											Tarih Aralığı
											<X
												className="ml-1 h-3 w-3 cursor-pointer"
												onClick={() => {
													void setStartDate("");
													void setEndDate("");
													void setPage(1);
												}}
											/>
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
