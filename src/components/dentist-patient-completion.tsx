"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { CheckCircle2 } from "lucide-react";

interface DentistPatientCompletionProps {
	patient: {
		id: string;
		isCompleted: boolean;
		completedAt: Date | null;
	};
}

export default function DentistPatientCompletion({ patient }: DentistPatientCompletionProps) {
	const markAsCompleted = api.dentist.patient.markAsCompleted.useMutation({
		onSuccess: () => {
			// Hasta tamamlandı, sayfayı yenile
			window.location.reload();
		},
	});

	return (
		<div className="pt-4 border-t">
			{patient.isCompleted ? (
				<div className="text-center">
					<Badge className="w-full bg-green-600 text-white py-2">
						<CheckCircle2 className="w-4 h-4 mr-2" />
						Tamamlandı
					</Badge>
					{patient.completedAt && (
						<p className="text-xs text-muted-foreground mt-2">
							{new Date(patient.completedAt).toLocaleDateString("tr-TR")} tarihinde tamamlandı
						</p>
					)}
				</div>
			) : (
				<Button 
					className="w-full bg-green-600 hover:bg-green-700 text-white" 
					size="sm"
					disabled={markAsCompleted.isPending}
					onClick={() => {
						markAsCompleted.mutate({ id: patient.id });
					}}
				>
					<CheckCircle2 className="w-4 h-4 mr-2" />
					{markAsCompleted.isPending ? 'Tamamlanıyor...' : 'Bitim Yap'}
				</Button>
			)}
		</div>
	);
}