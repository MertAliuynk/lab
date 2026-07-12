"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { CheckCircle2, Undo2 } from "lucide-react";

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

	const markAsOngoing = api.dentist.patient.markAsOngoing.useMutation({
		onSuccess: () => {
			// Bitim geri alındı, sayfayı yenile
			window.location.reload();
		},
	});

	return (
		<div className="pt-4 border-t">
			{patient.isCompleted ? (
				<div className="text-center space-y-2">
					<Badge className="w-full bg-green-600 text-white py-2">
						<CheckCircle2 className="w-4 h-4 mr-2" />
						Tamamlandı
					</Badge>
					{patient.completedAt && (
						<p className="text-xs text-muted-foreground">
							{new Date(patient.completedAt).toLocaleDateString("tr-TR")} tarihinde tamamlandı
						</p>
					)}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm" className="w-full" disabled={markAsOngoing.isPending}>
								<Undo2 className="w-4 h-4 mr-2" />
								{markAsOngoing.isPending ? "Geri Alınıyor..." : "Bitimi Geri Al"}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Bitimi Geri Al</AlertDialogTitle>
								<AlertDialogDescription>
									Bu hastanın bitim durumunu geri almak istediğinizden emin misiniz? Hasta tekrar "Devam Ediyor"
									durumuna alınacak.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>İptal</AlertDialogCancel>
								<AlertDialogAction onClick={() => markAsOngoing.mutate({ id: patient.id })}>
									Evet, Geri Al
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			) : (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							className="w-full bg-green-600 hover:bg-green-700 text-white"
							size="sm"
							disabled={markAsCompleted.isPending}
						>
							<CheckCircle2 className="w-4 h-4 mr-2" />
							{markAsCompleted.isPending ? "Tamamlanıyor..." : "Bitim Yap"}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Bitim Yap</AlertDialogTitle>
							<AlertDialogDescription>
								Bu hastayı bitim yapmak istediğinizden emin misiniz? Bu işlemden sonra hasta "Tamamlandı" olarak
								işaretlenecek. Yanlışlıkla yaptıysanız daha sonra "Bitimi Geri Al" ile geri alabilirsiniz.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>İptal</AlertDialogCancel>
							<AlertDialogAction onClick={() => markAsCompleted.mutate({ id: patient.id })}>
								Evet, Bitim Yap
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
