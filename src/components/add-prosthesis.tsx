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

type Add_prostheis_props = {
	patientId: string;
	dentistId?: string;
	onSuccess?: () => void;
};

export default function add_prostheis({
	patientId,
	dentistId,
	onSuccess,
}: Add_prostheis_props) {
	const { openSheet } = useProsthesisSheet();
	const router = useRouter();
	const utils = api.useUtils();

	// Hastanın mevcut protezlerini getir
	const { data: currentProstheses = [], isLoading: currentProsthesesLoading } = 
		api.laboratoryTechnician.patient.getDentalWorks.useQuery({
			patientId,
		});

	// Protez silme mutation
	const removeProsthesisMutation = api.laboratoryTechnician.dentalWork.deleteProsthesis.useMutation({
		onSuccess: () => {
			toast.success("Protez başarıyla silindi");
			utils.laboratoryTechnician.patient.getDentalWorks.invalidate({ patientId });
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
									<Button
										variant="destructive"
										size="sm"
										onClick={() => removeProsthesisMutation.mutate({ id: prosthesis.id })}
										disabled={removeProsthesisMutation.isPending}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
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
				onClick={() => openSheet(patientId, dentistId)}
			>
				<Plus className="h-4 w-4 mr-2" />
				Protez Ekle
			</Button>
		</div>
	);
}