import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgetPasswordLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<Skeleton className="h-8 w-48 mx-auto mb-2" />
					<Skeleton className="h-4 w-64 mx-auto" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<Skeleton className="h-10 w-full" />
					<div className="text-center">
						<Skeleton className="h-4 w-32 mx-auto" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
