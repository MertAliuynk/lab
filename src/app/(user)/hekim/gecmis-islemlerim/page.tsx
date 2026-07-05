import { HistoryContent } from "./_components/history-content";
import { HistoryFilters } from "./_components/history-filters";
import { HistoryHeader } from "./_components/history-header";

interface PageProps {
	searchParams: Promise<{
		q?: string;
		status?: "all" | "ongoing" | "completed";
		startDate?: string;
		endDate?: string;
		prosthesisType?: string;
		stage?: string;
		page?: string;
		sort?: string;
	}>;
}

export default async function Page({ searchParams }: PageProps) {
	const resolvedSearchParams = await searchParams;

	return (
		<div className="space-y-6">
			<HistoryFilters searchParams={resolvedSearchParams} />
			<HistoryHeader searchParams={resolvedSearchParams} />
			<HistoryContent searchParams={resolvedSearchParams} />
		</div>
	);
}
