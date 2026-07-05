import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeknisyenLoading() {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<Skeleton className="h-8 w-64 mx-auto mb-2" />
				<Skeleton className="h-4 w-48 mx-auto" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }, (_, i) => (
					<Card key={i}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-6 w-16" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-6 w-16" />
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
