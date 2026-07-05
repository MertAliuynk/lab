"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProsthesisSheet } from "@/contexts/prosthesis-sheet-context";

type AddDentistProsthesisProps = {
	patientId: string;
	onSuccess?: () => void;
};

export default function AddDentistProsthesis({
	patientId,
	onSuccess,
}: AddDentistProsthesisProps) {
	const { openSheet } = useProsthesisSheet();
	const router = useRouter();
	const utils = api.useUtils();

	// Hastanın mevcut protezlerini getir
	const { data: currentProstheses = [], isLoading: currentProsthesesLoading } = 
		api.dentist.dentalWork.getByPatientId.useQuery({
			patientId,
		});

	// Protez silme mutation
	const removeProsthesisMutation = api.dentist.dentalWork.delete.useMutation({
		onSuccess: () => {
			toast.success("Protez başarıyla silindi");
			utils.dentist.dentalWork.getByPatientId.invalidate({ patientId });
			router.refresh();
			onSuccess?.();
		},
		onError: () => {
			toast.error("Protez silinirken bir hata oluştu");
		},
	});

	return (
		<div className="space-y-4">
			{/* Mevcut Protezler */}
			<div className="space-y-2">
				<h4 className="font-medium text-sm text-gray-700">Mevcut Protezler</h4>
				{currentProsthesesLoading ? (
					<div className="text-sm text-gray-500">Protezler yükleniyor...</div>
				) : currentProstheses.length === 0 ? (
					<div className="text-sm text-gray-500">Henüz protez eklenmemiş</div>
				) : (
					<div className="space-y-2">
						{currentProstheses.map((prosthesis) => (
							<Card key={prosthesis.id} className="p-3">
								<div className="flex justify-between items-start">
									<div className="space-y-1">
										<div className="font-medium text-sm">{prosthesis.prosthesisType.name}</div>
										{prosthesis.prosthesisStage && (
											<Badge variant="secondary" className="text-xs">
												{prosthesis.prosthesisStage.name}
											</Badge>
										)}
										{prosthesis.notes && (
											<div className="text-xs text-gray-600">{prosthesis.notes}</div>
										)}
										<div className="text-xs text-gray-500">
											{format(new Date(prosthesis.createdAt), "dd MMM yyyy", { locale: tr })}
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Protez Ekleme */}
			<Button 
				className="w-full" 
				size="sm"
				onClick={() => openSheet(patientId)}
			>
				<Plus className="h-4 w-4 mr-2" />
				Protez Ekle
			</Button>
		</div>
	);
}