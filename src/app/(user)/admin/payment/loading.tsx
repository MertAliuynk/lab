import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLoading() {
	return (
		<div className="p-6 space-y-8">
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<Skeleton className="h-6 w-32 mx-auto mb-2" />
						<Skeleton className="w-20 h-1 mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						{Array.from({ length: 4 }, (_, i) => (
							<div
								key={i}
								className="relative bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 text-center shadow-lg"
							>
								<Skeleton className="h-8 w-16 mx-auto mb-2" />
								<Skeleton className="h-4 w-20 mx-auto mb-3" />
								<Skeleton className="h-1 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<Skeleton className="h-6 w-32" />

				{Array.from({ length: 5 }, (_, i) => (
					<Card key={i} className="border-l-4 border-l-blue-500">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-6 w-40" />
									<Skeleton className="h-4 w-24" />
								</div>

								<div className="flex-1 mx-8 space-y-3">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-32" />
									</div>
									<Skeleton className="h-2 w-full" />
								</div>

								<div className="text-right space-y-2 mr-4">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-6 w-20" />
								</div>

								<Skeleton className="h-9 w-24" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
