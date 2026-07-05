import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<Skeleton className="h-8 w-40 mx-auto mb-2" />
					<Skeleton className="h-4 w-56 mx-auto" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>
		</div>
	);
}
