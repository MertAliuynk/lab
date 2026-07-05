"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import FileUploadArea, { type FileUploadAreaRef } from "./file-upload-area";

type UploadedFile = {
	url: string;
	name: string;
	type: "image" | "video";
};

type UpdateStageFormProps = {
	dentalWorkId: string;
	currentStageId?: string;
	currentStageName?: string;
	onSuccess?: () => void;
	isAdmin?: boolean;
};

export default function UpdateStageForm({
	dentalWorkId,
	currentStageId,
	currentStageName,
	onSuccess,
	isAdmin = false,
}: UpdateStageFormProps) {
	const [selectedStageId, setSelectedStageId] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const fileUploadRef = useRef<FileUploadAreaRef>(null);
	const router = useRouter();
	const utils = api.useUtils();

	const { data: prosthesisStages = [] } = api.admin.prosthesisStage.getAll.useQuery({});

	const updateStageMutation = isAdmin
		? api.admin.dentalWork.updateStage.useMutation({
				onSuccess: async () => {
					toast.success("Aşama başarıyla güncellendi!");
					setSelectedStageId("");
					setNotes("");
					setUploadedFiles([]);
					fileUploadRef.current?.clearFiles();

					await utils.admin.dentalWork.getByPatientId.invalidate();
					await utils.admin.dentalWork.getStageHistory.invalidate();
					await utils.admin.patient.getById.invalidate();

					router.refresh();
					onSuccess?.();
				},
				onError: (error: { message?: string }) => {
					toast.error(error.message || "Aşama güncellenirken hata oluştu!");
				},
			})
		: api.dentist.dentalWork.updateStage.useMutation({
				onSuccess: async () => {
					toast.success("Aşama başarıyla güncellendi!");
					setSelectedStageId("");
					setNotes("");
					setUploadedFiles([]);
					fileUploadRef.current?.clearFiles();

					await utils.dentist.dentalWork.getByPatientId.invalidate();
					await utils.dentist.dentalWork.getStageHistory.invalidate();
					await utils.dentist.patient.getById.invalidate();

					await utils.laboratoryTechnician.patient.getAll.invalidate();
					await utils.laboratoryTechnician.patient.getById.invalidate();
					await utils.laboratoryTechnician.patient.getDentalWorks.invalidate();
					await utils.laboratoryTechnician.dentalWork.getAll.invalidate();

					router.refresh();
					onSuccess?.();
				},
				onError: (error: { message?: string }) => {
					toast.error(error.message || "Aşama güncellenirken hata oluştu!");
				},
			});

	const handleUpdateStage = () => {
		if (!selectedStageId) {
			toast.error("Lütfen yeni aşama seçin!");
			return;
		}

		updateStageMutation.mutate({
			dentalWorkId,
			prosthesisStageId: selectedStageId,
			notes: notes || undefined,
			attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
		});
	};

	const currentStage = prosthesisStages.find((stage) => stage.id === currentStageId);
	const stageItems = prosthesisStages.map((stage) => ({
		id: stage.id,
		name: stage.name,
	}));

	const handleStageChange = (value: string | string[] | number | number[]) => {
		setSelectedStageId(value as string);
	};

	const handleFilesChange = (files: UploadedFile[]) => {
		setUploadedFiles(files);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<RefreshCw className="w-5 h-5" />
					<span>Aşama Güncelle</span>
					{isAdmin && (
						<Badge variant="destructive" className="text-xs">
							Admin
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{(currentStageName || currentStage) && (
					<div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
						<p className="text-sm">
							<span className="font-medium text-blue-800">Mevcut Aşama:</span>{" "}
							<span className="text-blue-700">{currentStageName || currentStage?.name}</span>
						</p>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="stage">Aşama Seç</Label>
					<Combobox
						items={stageItems}
						value={selectedStageId}
						onChange={handleStageChange}
						placeholder="Aşama seçin..."
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notlar (Opsiyonel)</Label>
					<Textarea
						id="notes"
						placeholder="Aşama değişikliği ile ilgili notlarınızı yazın..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label>Dosyalar (Opsiyonel)</Label>
					<FileUploadArea ref={fileUploadRef} onFilesChange={handleFilesChange} />
				</div>

				<Button
					onClick={handleUpdateStage}
					disabled={updateStageMutation.isPending || !selectedStageId}
					className="w-full"
				>
					<Save className="w-4 h-4 mr-2" />
					{updateStageMutation.isPending ? "Güncelleniyor..." : "Aşamayı Güncelle"}
				</Button>
			</CardContent>
		</Card>
	);
}
