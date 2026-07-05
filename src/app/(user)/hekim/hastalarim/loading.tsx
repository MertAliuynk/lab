import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="w-80 h-10 bg-gray-200 animate-pulse rounded-md" />
			</div>

			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<div className="w-32 h-6 bg-gray-300 animate-pulse rounded mx-auto mb-2" />
						<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center shadow-lg">
								<div className="w-16 h-8 bg-gray-300 animate-pulse rounded mx-auto mb-1" />
								<div className="w-24 h-4 bg-gray-300 animate-pulse rounded mx-auto" />
								<div className="w-full h-1 bg-blue-200 rounded-full mt-3" />
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full opacity-20 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg">
								<div className="w-16 h-8 bg-gray-300 animate-pulse rounded mx-auto mb-1" />
								<div className="w-24 h-4 bg-gray-300 animate-pulse rounded mx-auto" />
								<div className="w-full h-1 bg-emerald-200 rounded-full mt-3" />
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full opacity-20 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 text-center shadow-lg">
								<div className="w-16 h-8 bg-gray-300 animate-pulse rounded mx-auto mb-1" />
								<div className="w-24 h-4 bg-gray-300 animate-pulse rounded mx-auto" />
								<div className="w-full h-1 bg-purple-200 rounded-full mt-3" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }, (_, i) => (
					<Card key={`patient-loading-${i}-${Math.random().toString(36).substring(7)}`} className="animate-pulse">
						<CardHeader className="pb-3">
							<div className="flex items-center space-x-3">
								<div className="w-12 h-12 bg-gray-300 rounded-full" />
								<div className="space-y-2">
									<div className="h-4 bg-gray-300 rounded w-32" />
									<div className="h-3 bg-gray-300 rounded w-24" />
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="h-3 bg-gray-300 rounded w-full" />
							<div className="h-3 bg-gray-300 rounded w-3/4" />
							<div className="h-3 bg-gray-300 rounded w-1/2" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
