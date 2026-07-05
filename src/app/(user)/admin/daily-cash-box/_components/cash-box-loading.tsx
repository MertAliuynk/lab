import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CashBoxLoadingProps {
	showHeader?: boolean;
}

export default function CashBoxLoading({ showHeader = true }: CashBoxLoadingProps) {
	return (
		<div className="space-y-6">
			{showHeader && (
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-10 w-[280px]" />
				</div>
			)}

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<Skeleton className="h-6 w-32 mx-auto mb-2" />
						<Skeleton className="w-20 h-1 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						{Array.from({ length: 5 }, (_, i) => (
							<div key={i} className="group relative">
								<div className="relative bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 text-center shadow-lg">
									<Skeleton className="h-9 w-24 mx-auto mb-2" />
									<Skeleton className="h-4 w-20 mx-auto mb-1" />
									<Skeleton className="h-3 w-16 mx-auto mb-3" />
									<Skeleton className="w-full h-1 rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{Array.from({ length: 2 }, (_, i) => (
					<Card key={i}>
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-8 w-24" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{Array.from({ length: 3 }, (_, j) => (
									<div key={j} className="p-3 bg-gray-50 rounded-lg border">
										<div className="flex items-center justify-between mb-2">
											<Skeleton className="h-5 w-20" />
											<Skeleton className="h-4 w-16" />
										</div>
										<Skeleton className="h-4 w-full mb-1" />
										<Skeleton className="h-3 w-24" />
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
