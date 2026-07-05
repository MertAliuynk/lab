import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeknisyenHastaDetailLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-48" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-8 w-32" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array.from({ length: 3 }, (_, i) => (
									<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex-1">
											<Skeleton className="h-5 w-32 mb-2" />
											<Skeleton className="h-4 w-48 mb-1" />
											<Skeleton className="h-4 w-36" />
										</div>
										<div className="flex items-center gap-2">
											<Skeleton className="h-6 w-20" />
											<Skeleton className="h-8 w-24" />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{Array.from({ length: 2 }, (_, i) => (
									<div key={i} className="p-3 border rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-20" />
										</div>
										<Skeleton className="h-4 w-full mb-1" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center">
									<Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
									<Skeleton className="h-6 w-32 mx-auto mb-2" />
									<Skeleton className="h-4 w-24 mx-auto" />
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-24" />
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-4 w-32" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
