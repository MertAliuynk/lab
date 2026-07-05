import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HekimLoading() {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<Skeleton className="h-8 w-64 mx-auto mb-2" />
				<Skeleton className="h-4 w-48 mx-auto" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{Array.from({ length: 4 }, (_, i) => (
					<Card key={i} className="hover:shadow-lg transition-shadow">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<Skeleton className="h-12 w-12 rounded-full" />
							</div>
							<Skeleton className="h-6 w-32 mx-auto mb-2" />
							<Skeleton className="h-4 w-24 mx-auto" />
						</CardHeader>
						<CardContent className="text-center">
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
