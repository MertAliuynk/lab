"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDatetimeLocalValue } from "@/lib/format";
import { api } from "@/trpc/react";
import { CalendarClock, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UpdateDeliveryDateFormProps = {
	dentalWorkId: string;
	currentDeliveryDate?: Date | null;
	onSuccess?: () => void;
};

export default function UpdateDeliveryDateForm({
	dentalWorkId,
	currentDeliveryDate,
	onSuccess,
}: UpdateDeliveryDateFormProps) {
	const [deliveryDate, setDeliveryDate] = useState<string>(
		currentDeliveryDate ? toDatetimeLocalValue(currentDeliveryDate) : "",
	);
	const router = useRouter();
	const utils = api.useUtils();

	const updateDeliveryDateMutation = api.dentist.dentalWork.updateDeliveryDate.useMutation({
		onSuccess: async () => {
			toast.success("Teslim tarihi başarıyla güncellendi!");

			await utils.dentist.dentalWork.getByPatientId.invalidate();
			await utils.dentist.dentalWork.getStageHistory.invalidate();

			router.refresh();
			onSuccess?.();
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Teslim tarihi güncellenirken hata oluştu!");
		},
	});

	const handleUpdate = () => {
		if (!deliveryDate) {
			toast.error("Lütfen teslim tarihi seçin!");
			return;
		}

		updateDeliveryDateMutation.mutate({
			dentalWorkId,
			deliveryDate: new Date(deliveryDate),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<CalendarClock className="w-5 h-5" />
					<span>Teslim Tarihini Güncelle</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="deliveryDate">Teslim Tarihi ve Saati</Label>
					<Input
						id="deliveryDate"
						type="datetime-local"
						value={deliveryDate}
						onChange={(e) => setDeliveryDate(e.target.value)}
					/>
				</div>

				<Button
					onClick={handleUpdate}
					disabled={updateDeliveryDateMutation.isPending || !deliveryDate}
					className="w-full"
				>
					<Save className="w-4 h-4 mr-2" />
					{updateDeliveryDateMutation.isPending ? "Güncelleniyor..." : "Teslim Tarihini Güncelle"}
				</Button>
			</CardContent>
		</Card>
	);
}
