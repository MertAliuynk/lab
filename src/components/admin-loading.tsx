import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLoadingProps {
	title?: string;
	showAddButton?: boolean;
	showTable?: boolean;
}

export default function AdminLoading({ showAddButton = true, showTable = true }: AdminLoadingProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
				{showAddButton && <Skeleton className="h-10 w-32" />}
			</div>

			{showTable && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<Skeleton className="h-6 w-40" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-8 w-24" />
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<Skeleton className="h-8 w-48" />
								<Skeleton className="h-8 w-32" />
								<Skeleton className="h-8 w-24" />
							</div>

							<div className="border rounded-lg">
								<div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/50">
									{Array.from({ length: 6 }, (_, i) => (
										<Skeleton key={i} className="h-4 w-full" />
									))}
								</div>
								{Array.from({ length: 5 }, (_, i) => (
									<div key={i} className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0">
										{Array.from({ length: 6 }, (_, j) => (
											<Skeleton key={j} className="h-4 w-full" />
										))}
									</div>
								))}
							</div>

							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-32" />
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-8" />
									<Skeleton className="h-8 w-8" />
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
