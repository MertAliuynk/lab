import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DentistPaymentLoading() {
	return (
		<div className="p-6 space-y-8">
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 w-24" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{Array.from({ length: 3 }, (_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-5 w-5" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-green-50 to-blue-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
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

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{Array.from({ length: 2 }, (_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array.from({ length: 5 }, (_, j) => (
									<div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div className="space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-16" />
											<Skeleton className="h-3 w-20" />
										</div>
										<div className="text-right space-y-2">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-6 w-12" />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
