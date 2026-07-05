import { Skeleton } from "@/components/ui/skeleton";

export function HistorySkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-64" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>

			<div className="flex items-center justify-center gap-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-8 w-8" />
				))}
			</div>
		</div>
	);
}

function SkeletonCard() {
	return (
		<div className="rounded-lg border bg-white p-6 space-y-4">
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-5 w-32" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-3 w-3 rounded-full" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
				<Skeleton className="h-6 w-20 rounded-full" />
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-8" />
				</div>
				<Skeleton className="h-2 w-full rounded-full" />
				<Skeleton className="h-3 w-20" />
			</div>

			<div className="grid grid-cols-2 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex items-center gap-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-16" />
					</div>
				))}
			</div>

			<div className="border-t pt-3">
				<div className="flex items-start gap-2">
					<Skeleton className="h-3 w-3 mt-0.5" />
					<div className="space-y-1 flex-1">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-3/4" />
					</div>
				</div>
			</div>
		</div>
	);
}
