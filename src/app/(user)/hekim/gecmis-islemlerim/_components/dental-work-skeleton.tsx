import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DentalWorkSkeleton = () => {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4 mb-6">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>

			{Array.from({ length: 5 }).map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-5 w-20" />
						</div>
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-28" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-36" />
							</div>
						</div>
						<div className="mt-4 pt-4 border-t">
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-8 w-24" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
