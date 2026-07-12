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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UpdateTechnicianStageFormProps = {
	dentalWorkId: string;
	currentTechnicianStageId?: string;
	currentProsthesisStage?: string;
	latestStageInfo?: {
		type: 'prosthesis' | 'technician';
		name: string;
		updatedAt: Date;
	};
	onSuccess?: () => void;
};

export default function UpdateTechnicianStageForm({
	dentalWorkId,
	currentTechnicianStageId,
	currentProsthesisStage,
	latestStageInfo,
	onSuccess,
}: UpdateTechnicianStageFormProps) {
	const [selectedStageId, setSelectedStageId] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const router = useRouter();
	const utils = api.useUtils();

	// Teknisyen aşamalarını getir
	const { data: technicianStages = [] } = api.laboratoryTechnician.technicianStage.getAll.useQuery({});

	const updateTechnicianStageMutation = api.laboratoryTechnician.dentalWork.updateTechnicianStage.useMutation({
		onSuccess: async () => {
			toast.success("Teknisyen aşaması başarıyla güncellendi!");
			setSelectedStageId("");
			setNotes("");

			// Cache'leri invalidate et
			await utils.laboratoryTechnician.patient.getAll.invalidate();
			await utils.laboratoryTechnician.patient.getById.invalidate();
			await utils.laboratoryTechnician.patient.getDentalWorks.invalidate();
			await utils.laboratoryTechnician.dentalWork.getAll.invalidate();
			await utils.laboratoryTechnician.dentalWork.getTechnicianStageHistory.invalidate();

			router.refresh();
			onSuccess?.();
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Teknisyen aşaması güncellenirken hata oluştu!");
		},
	});

	const handleUpdateTechnicianStage = () => {
		if (!selectedStageId) {
			toast.error("Lütfen yeni teknisyen aşaması seçin!");
			return;
		}

		updateTechnicianStageMutation.mutate({
			dentalWorkId,
			technicianStageId: selectedStageId,
			notes: notes || undefined,
		});
	};

	const handleStageChange = (value: string | number | string[] | number[]) => {
		if (typeof value === 'string') {
			setSelectedStageId(value);
		}
	};

	const stageOptions = technicianStages.map((stage) => ({
		id: stage.id,
		name: stage.name,
	}));

	const currentStage = technicianStages.find((stage) => stage.id === currentTechnicianStageId);
	const selectedStage = technicianStages.find((stage) => stage.id === selectedStageId);

	return (
		<Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center text-orange-700">
					<RefreshCw className="w-5 h-5 mr-2" />
					Teknisyen Aşama Güncelle
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{(latestStageInfo || currentStage) && (
					<div className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">Mevcut Aşama:</span>
						{latestStageInfo ? (
							<div className="flex items-center gap-2">
								<Badge 
									variant="outline" 
									className={latestStageInfo.type === 'prosthesis' ? "border-blue-300 text-blue-700" : "border-orange-300 text-orange-700"}
								>
									{latestStageInfo.name}
								</Badge>
								<span className="text-xs text-muted-foreground">
									({latestStageInfo.type === 'prosthesis' ? 'Doktor' : 'Teknisyen'} Aşaması)
								</span>
							</div>
						) : currentStage ? (
							<Badge variant="outline" className="border-orange-300 text-orange-700">
								{currentStage.name}
							</Badge>
						) : null}
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="stage-select">Yeni Teknisyen Aşama Seç</Label>
					<Combobox
						items={stageOptions}
						value={selectedStageId}
						onChange={handleStageChange}
						placeholder="Teknisyen aşama seçin..."
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notlar (İsteğe bağlı)</Label>
					<Textarea
						id="notes"
						placeholder="Bu aşama için notlar ekleyin..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={3}
					/>
				</div>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							disabled={!selectedStageId || updateTechnicianStageMutation.isPending}
							className="w-full bg-orange-600 hover:bg-orange-700"
						>
							<Save className="w-4 h-4 mr-2" />
							{updateTechnicianStageMutation.isPending ? "Güncelleniyor..." : "Teknisyen Aşamasını Güncelle"}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Teknisyen Aşamasını Güncelle</AlertDialogTitle>
							<AlertDialogDescription>
								Aşamayı <strong>{selectedStage?.name}</strong> olarak güncellemek istediğinizden emin misiniz?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>İptal</AlertDialogCancel>
							<AlertDialogAction onClick={handleUpdateTechnicianStage}>Evet, Güncelle</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}