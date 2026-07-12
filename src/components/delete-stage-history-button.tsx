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
import { api } from "@/trpc/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DeleteStageHistoryButtonProps = {
	role: "dentist" | "technician";
	historyId: string;
	stageName?: string;
	onDeleted?: () => void;
};

export default function DeleteStageHistoryButton({
	role,
	historyId,
	stageName,
	onDeleted,
}: DeleteStageHistoryButtonProps) {
	const router = useRouter();
	const handleSuccess = () => {
		toast.success("Aşama kaydı geri alındı");
		if (onDeleted) {
			onDeleted();
		} else {
			router.refresh();
		}
	};

	const dentistMutation = api.dentist.dentalWork.deleteStageHistory.useMutation({
		onSuccess: handleSuccess,
		onError: (error) => toast.error(error.message || "Aşama silinirken hata oluştu"),
	});

	const technicianMutation = api.laboratoryTechnician.dentalWork.deleteTechnicianStageHistory.useMutation({
		onSuccess: handleSuccess,
		onError: (error) => toast.error(error.message || "Aşama silinirken hata oluştu"),
	});

	const isPending = role === "dentist" ? dentistMutation.isPending : technicianMutation.isPending;

	const handleDelete = () => {
		if (role === "dentist") {
			dentistMutation.mutate({ stageHistoryId: historyId });
		} else {
			technicianMutation.mutate({ technicianStageHistoryId: historyId });
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					size="icon"
					className="h-6 w-6"
					disabled={isPending}
					aria-label="Aşamayı Geri Al"
				>
					<Trash2 className="w-3 h-3" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Aşamayı Geri Al</AlertDialogTitle>
					<AlertDialogDescription>
						Bu son aşama kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
						{stageName && (
							<>
								<br />
								<br />
								<strong>Aşama:</strong> {stageName}
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>İptal</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
						Evet, Geri Al
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
