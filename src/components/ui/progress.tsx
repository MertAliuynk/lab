"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Progress({
	className,
	color = "primary",
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	const colorClass = color === "primary" ? "bg-primary" : "bg-green-400";
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className={cn("h-full w-full flex-1 transition-all", color === "primary" ? "bg-primary" : "bg-green-400")}
				style={{ transform: `translateX(-${100 - (value || 0)}%)`, backgroundColor: colorClass }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
