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

interface TechnicianDentalWorkCompletionProps {
	dentalWork: {
		id: string;
		isCompleted: boolean;
	};
}

export default function TechnicianDentalWorkCompletion({ dentalWork }: TechnicianDentalWorkCompletionProps) {
	const markAsCompleted = api.laboratoryTechnician.patient.markAsCompleted.useMutation({
		onSuccess: () => {
			window.location.reload();
		},
	});

	const markAsOngoing = api.laboratoryTechnician.patient.markAsOngoing.useMutation({
		onSuccess: () => {
			window.location.reload();
		},
	});

	return (
		<div className="pt-2">
			{dentalWork.isCompleted ? (
				<div className="text-center space-y-2">
					<Badge className="w-full bg-green-600 text-white py-2">
						<CheckCircle2 className="w-4 h-4 mr-2" />
						Tedavi Tamamlandı
					</Badge>
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
									Bu tedavinin bitim durumunu geri almak istediğinizden emin misiniz? Tedavi tekrar "Devam
									Ediyor" durumuna alınacak.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>İptal</AlertDialogCancel>
								<AlertDialogAction onClick={() => markAsOngoing.mutate({ dentalWorkId: dentalWork.id })}>
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
								Bu tedaviyi bitim yapmak istediğinizden emin misiniz? Bu işlemden sonra tedavi "Tamamlandı"
								olarak işaretlenecek. Yanlışlıkla yaptıysanız daha sonra "Bitimi Geri Al" ile geri alabilirsiniz.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>İptal</AlertDialogCancel>
							<AlertDialogAction onClick={() => markAsCompleted.mutate({ dentalWorkId: dentalWork.id })}>
								Evet, Bitim Yap
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
