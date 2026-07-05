"use client";

import { ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export const ScrollTop = ({
	variant = "outline",
	size = "icon",
	className,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShow(window.scrollY > 100);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const handleClick = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Button
			onClick={handleClick}
			size={size}
			variant={variant}
			className={cn("fixed bottom-4 right-4 bg-background transition", show ? "opacity-100" : "opacity-0", className)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
			<span className="sr-only">Scroll to top</span>
		</Button>
	);
};
