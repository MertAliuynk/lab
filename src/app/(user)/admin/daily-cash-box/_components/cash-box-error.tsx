"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface CashBoxErrorProps {
	error?: string;
	onRetry?: () => void;
}

export default function CashBoxError({ error, onRetry }: CashBoxErrorProps) {
	return (
		<div className="space-y-6">
			<Card className="border-red-200">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<AlertTriangle className="h-12 w-12 text-red-500" />
					</div>
					<CardTitle className="text-red-700">Bir Hata Oluştu</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-muted-foreground mb-4">{error || "Günlük kasa verileri yüklenirken bir hata oluştu."}</p>
					{onRetry && (
						<Button onClick={onRetry} variant="outline" className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Tekrar Dene
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
