"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import SelectTeeth from "./select-teeth";

interface ToothGroup {
	selectedTeeth: number[];
	selectedJaws: string[];
	prosthesisType: string;
	prosthesisStage: string;
}

interface ToothGroupDialogProps {
	onGroupConfirm: (group: ToothGroup) => void;
	children: React.ReactNode;
	disabledTeeth: number[];
	excludeTypes?: string[];
	initialData?: ToothGroup;
}

export default function ToothGroupDialog({
	onGroupConfirm,
	children,
	disabledTeeth,
	excludeTypes = [],
	initialData,
}: ToothGroupDialogProps) {
	const [open, setOpen] = useState(false);
	const form = useFormContext();

	const { data: prosthesisTypes } = api.admin.prosthesisType.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	useEffect(() => {
		if (open && initialData) {
			form.setValue("tempGroup.selectedTeeth", initialData.selectedTeeth);
			form.setValue("tempGroup.selectedJaws", initialData.selectedJaws);
			form.setValue("tempGroup.prosthesisType", initialData.prosthesisType);
			form.setValue("tempGroup.prosthesisStage", initialData.prosthesisStage);
		} else if (open && !initialData) {
			form.setValue("tempGroup.selectedTeeth", []);
			form.setValue("tempGroup.selectedJaws", []);
			form.setValue("tempGroup.prosthesisType", "");
			form.setValue("tempGroup.prosthesisStage", "");
		}
	}, [open, initialData, form]);

	const handleConfirm = () => {
		const tempGroup = form.getValues("tempGroup");
		const selectedProsthesisTypeId = tempGroup?.prosthesisType;
		const selectedProsthesisType = prosthesisTypes?.find((type) => type.id === selectedProsthesisTypeId);
		const isPricingJawBased = selectedProsthesisType?.pricingType === "JAW_BASED";

		if (isPricingJawBased) {
			if (!tempGroup?.selectedJaws?.length) {
				toast.error("En az bir çene seçmelisiniz");
				return;
			}
		} else {
			if (!tempGroup?.selectedTeeth?.length) {
				toast.error("En az bir diş seçmelisiniz");
				return;
			}
		}

		if (!tempGroup?.prosthesisType) {
			toast.error("Protez tipi seçmelisiniz");
			return;
		}

		if (!tempGroup?.prosthesisStage) {
			toast.error("Protez aşaması seçmelisiniz");
			return;
		}

		onGroupConfirm({
			selectedTeeth: tempGroup.selectedTeeth || [],
			selectedJaws: tempGroup.selectedJaws || [],
			prosthesisType: tempGroup.prosthesisType,
			prosthesisStage: tempGroup.prosthesisStage,
		});

		form.setValue("tempGroup.selectedTeeth", []);
		form.setValue("tempGroup.selectedJaws", []);
		form.setValue("tempGroup.prosthesisType", "");
		form.setValue("tempGroup.prosthesisStage", "");

		setOpen(false);
	};

	const handleCancel = () => {
		form.setValue("tempGroup.selectedTeeth", []);
		form.setValue("tempGroup.selectedJaws", []);
		form.setValue("tempGroup.prosthesisType", "");
		form.setValue("tempGroup.prosthesisStage", "");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{initialData ? "Protezi Düzenle" : "Protez Oluştur"}</DialogTitle>
					<DialogDescription>Protez için dişleri seçin, protez tipini ve aşamasını belirleyin.</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="border rounded-lg p-4">
						<SelectTeeth groupIndex="tempGroup" disabledTeeth={disabledTeeth} excludeTypes={excludeTypes} />
					</div>

					<DialogFooter className="gap-2">
						<Button type="button" variant="outline" onClick={handleCancel}>
							İptal
						</Button>
						<Button type="button" onClick={handleConfirm}>
							{initialData ? "Güncelle" : "Onayla"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
