"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface HistoryPaginationProps {
	currentPage: number;
	totalPages: number;
	searchParams: Record<string, string>;
}

export function HistoryPagination({ currentPage, totalPages, searchParams }: HistoryPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (totalPages <= 1) return null;

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.push(createPageUrl(page));
		});
	};

	const createPageUrl = (page: number) => {
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(searchParams)) {
			if (value && key !== "page") {
				params.set(key, value);
			}
		}

		if (page > 1) {
			params.set("page", page.toString());
		}

		return `?${params.toString()}`;
	};

	const getPageNumbers = () => {
		const delta = 2;
		const range: (number | string)[] = [];
		const rangeWithDots: (number | string)[] = [];

		for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const pages = getPageNumbers();

	return (
		<div className="flex items-center justify-center space-x-2 py-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => handlePageChange(currentPage - 1)}
				disabled={currentPage <= 1 || isPending}
				className="h-9 w-9 p-0"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pages.map((page, index) => {
				if (typeof page === "string") {
					return (
						<span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm">
							{page}
						</span>
					);
				}

				const pageNum = page as number;
				const isActive = pageNum === currentPage;

				return (
					<Button
						key={pageNum}
						variant={isActive ? "default" : "outline"}
						size="sm"
						onClick={() => handlePageChange(pageNum)}
						disabled={isPending}
						className={cn("h-9 w-9 p-0", isActive && "bg-blue-600 text-white hover:bg-blue-700")}
					>
						{pageNum}
					</Button>
				);
			})}

			<Button
				variant="outline"
				size="sm"
				onClick={() => handlePageChange(currentPage + 1)}
				disabled={currentPage >= totalPages || isPending}
				className="h-9 w-9 p-0"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
