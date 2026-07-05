import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BildirimlerLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-20" />
			</div>

			<div className="space-y-4">
				{Array.from({ length: 5 }, (_, i) => (
					<Card key={i}>
						<CardContent className="p-4">
							<div className="flex items-start gap-4">
								<Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
								<div className="flex-1 space-y-2">
									<div className="flex items-center justify-between">
										<Skeleton className="h-5 w-48" />
										<Skeleton className="h-4 w-16" />
									</div>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<div className="flex items-center gap-2 mt-3">
										<Skeleton className="h-6 w-16" />
										<Skeleton className="h-6 w-20" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex items-center justify-center">
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
	);
}
