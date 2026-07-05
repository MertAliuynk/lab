import { Suspense } from "react";

export default function Loading() {
	return (
		<div className="space-y-5">
			<div className="h-8 bg-gray-200 rounded animate-pulse" />
			<div className="h-64 bg-gray-200 rounded animate-pulse" />
		</div>
	);
}