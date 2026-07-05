import Spinner from "./spinner";

export default function DashboardHeader({
	title,
	description,
	isLoading,
	rightContent,
}: {
	title: string | React.ReactNode;
	description?: string;
	isLoading?: boolean;
	rightContent?: React.ReactNode;
}) {
	return (
		<div className="flex items-end justify-between">
			<div className="flex items-center gap-2">
				<div>
					<h1 className="text-lg font-medium">{title}</h1>
					{description && <p className="text-xs text-muted-foreground">{description}</p>}
				</div>
				{isLoading && <Spinner className="size-4" />}
			</div>
			{rightContent}
		</div>
	);
}
