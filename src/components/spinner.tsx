import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
	className?: string;
	label?: string;
};

export default function Spinner({ className, label }: SpinnerProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<Loader2 className={cn("size-5 animate-spin", className)} />
			{label && <p className="text-sm text-muted-foreground">{label}</p>}
		</div>
	);
}
