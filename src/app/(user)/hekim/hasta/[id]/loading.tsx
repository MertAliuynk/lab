import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HekimPatientDetailLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
				<div className="lg:col-span-3 space-y-5 sticky top-6 self-start">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center text-lg">
								<Skeleton className="w-5 h-5 mr-2 rounded-full" />
								<Skeleton className="h-6 w-32" />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center pb-4 border-b">
								<Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
								<Skeleton className="h-6 w-32 mx-auto mb-2" />
								<Skeleton className="h-4 w-24 mx-auto" />
							</div>
							<div className="space-y-3">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-24" />
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="lg:col-span-7 space-y-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
					</div>
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-40" />
						</CardHeader>
						<CardContent className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
									<Skeleton className="h-6 w-16" />
								</div>
							))}
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							{Array.from({ length: 2 }).map((_, i) => (
								<div key={i} className="p-3 border rounded-lg">
									<Skeleton className="h-4 w-32 mb-2" />
									<Skeleton className="h-4 w-full" />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
