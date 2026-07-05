"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { Heart, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Types
type AdditionalTreatment = {
	id: string;
	name: string;
	description?: string | null;
	defaultPrice?: number | null;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type DentalWorkAdditionalTreatment = {
	id: string;
	dentalWorkId: string;
	additionalTreatmentId: string;
	price?: number | null;
	notes?: string | null;
	additionalTreatment: AdditionalTreatment;
	createdAt: Date;
	updatedAt: Date;
};

type AddAdditionalTreatmentProps = {
	dentalWorkId: string;
	onSuccess?: () => void;
	hideUnitPriceInput?: boolean;
};

export default function AddAdditionalTreatment({
	dentalWorkId,
	onSuccess,
	hideUnitPriceInput = false,
}: AddAdditionalTreatmentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>("");
	const [price, setPrice] = useState<number | undefined>();
	const [quantity, setQuantity] = useState<number | undefined>(undefined);
	const [notes, setNotes] = useState<string>("");
	const router = useRouter();
	const utils = api.useUtils();

	// Mevcut ek tedavileri getir
	const { data: currentTreatments = [], isLoading: currentTreatmentsLoading } = 
		api.laboratoryTechnician.dentalWork.getAdditionalTreatments.useQuery({
			dentalWorkId,
		}) as { data: DentalWorkAdditionalTreatment[], isLoading: boolean };

	// Tüm ek tedavileri getir
	const { data: allTreatments = [], isLoading: allTreatmentsLoading, error: allTreatmentsError } = 
		api.laboratoryTechnician.getAdditionalTreatments.useQuery() as { data: AdditionalTreatment[], isLoading: boolean, error: any };

	// Debug için console log ekleyelim
	console.log('All treatments:', allTreatments);
	console.log('All treatments loading:', allTreatmentsLoading);
	console.log('All treatments error:', allTreatmentsError);

	// Ek tedavi ekleme mutation
	const addTreatmentMutation = api.laboratoryTechnician.dentalWork.addAdditionalTreatment.useMutation({
		onSuccess: async () => {
			toast.success("Ek tedavi başarıyla eklendi!");
			setSelectedTreatmentId("");
			setPrice(undefined);
			setNotes("");
			setIsOpen(false);

			// Cache'leri invalidate et
			await utils.laboratoryTechnician.dentalWork.getAdditionalTreatments.invalidate();
			await utils.laboratoryTechnician.patient.getDentalWorks.invalidate();

			router.refresh();
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Ek tedavi eklenirken hata oluştu!");
		},
	});

	// Ek tedavi silme mutation
	const removeTreatmentMutation = api.laboratoryTechnician.dentalWork.removeAdditionalTreatment.useMutation({
		onSuccess: async () => {
			toast.success("Ek tedavi başarıyla kaldırıldı!");
			
			// Cache'leri invalidate et
			await utils.laboratoryTechnician.dentalWork.getAdditionalTreatments.invalidate();
			await utils.laboratoryTechnician.patient.getDentalWorks.invalidate();

			router.refresh();
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Ek tedavi kaldırılırken hata oluştu!");
		},
	});

	const handleAddTreatment = () => {
		if (!selectedTreatmentId) {
			toast.error("Lütfen bir ek tedavi seçin!");
			return;
		}

		const selectedTreatment = allTreatments.find((t: AdditionalTreatment) => t.id === selectedTreatmentId);
		const unitPrice = price || selectedTreatment?.defaultPrice || 0;
		const totalPrice = unitPrice * (quantity || 1);

		addTreatmentMutation.mutate({
			dentalWorkId,
			additionalTreatmentId: selectedTreatmentId,
			price: totalPrice,
			quantity: quantity || 1,
			notes: notes || undefined,
		});
	};

	const handleRemoveTreatment = (treatmentRecordId: string) => {
		removeTreatmentMutation.mutate({
			dentalWorkId,
			id: treatmentRecordId,
		});
	};

	const handleTreatmentChange = (value: string | number | string[] | number[]) => {
		if (typeof value === 'string') {
			setSelectedTreatmentId(value);
			
			// Seçilen tedavinin varsayılan fiyatını set et
			const selectedTreatment = allTreatments.find((t: AdditionalTreatment) => t.id === value);
			if (selectedTreatment?.defaultPrice) {
				setPrice(selectedTreatment.defaultPrice);
			}
		}
	};

	// Backend zaten isDeleted=false filtresi yapıyor
	const availableTreatments = allTreatments;

	const treatmentOptions = availableTreatments.map((treatment: AdditionalTreatment) => ({
		id: treatment.id,
		name: hideUnitPriceInput 
			? treatment.name 
			: `${treatment.name}${treatment.defaultPrice ? ` (₺${treatment.defaultPrice})` : ''}`,
	}));

	return (
		<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center text-green-700">
					<Heart className="w-5 h-5 mr-2" />
					Ek Tedaviler
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Mevcut Ek Tedaviler */}
				{currentTreatmentsLoading ? (
					<div className="animate-pulse space-y-2">
						<div className="h-4 bg-gray-300 rounded w-3/4" />
						<div className="h-4 bg-gray-300 rounded w-1/2" />
					</div>
				) : currentTreatments.length > 0 ? (
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Eklenmiş Tedaviler:</Label>
						{currentTreatments.map((treatment, index) => (
							<div
								key={`${treatment.id}-${index}`}
								className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<Heart className="w-4 h-4 text-green-600" />
										<span className="font-medium text-gray-900">
											{treatment.additionalTreatment.name}
										</span>
										{!hideUnitPriceInput && treatment.price && (
											<Badge variant="outline" className="text-green-700 border-green-300">
												₺{treatment.price.toLocaleString('tr-TR')}
											</Badge>
										)}
									</div>
									{treatment.notes && (
										<p className="text-sm text-gray-600 mt-1 ml-6">{treatment.notes}</p>
									)}
								</div>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => handleRemoveTreatment(treatment.id)}
									disabled={removeTreatmentMutation.isPending}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
									title="Bu tedaviyi kaldır"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-600">Henüz ek tedavi eklenmemiş.</p>
				)}

				{/* Ek Tedavi Ekleme Butonu - Her zaman görünsün */}
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button className="w-full bg-green-600 hover:bg-green-700 text-white">
							<Plus className="w-4 h-4 mr-2" />
							Ek Tedavi Ekle
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Heart className="w-5 h-5 text-green-600" />
								Ek Tedavi Ekle
							</DialogTitle>
							<DialogDescription>
								Bu işleme ek tedavi ekleyebilirsiniz. Aynı tedaviyi birden fazla kez ekleyebilirsiniz.
							</DialogDescription>
						</DialogHeader>

						{availableTreatments.length === 0 ? (
							<div className="text-center py-6">
								<p className="text-sm text-gray-600 mb-4">
									{allTreatmentsLoading 
										? "Ek tedaviler yükleniyor..." 
										: allTreatmentsError 
										? `Hata: ${allTreatmentsError.message}` 
										: "Aktif ek tedavi bulunmuyor."
									}
								</p>
								{!allTreatmentsLoading && !allTreatmentsError && (
									<p className="text-xs text-gray-500">Admin panelinden ek tedavi tanımlaması yapmanız gerekiyor.</p>
								)}
							</div>
						) : (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Ek Tedavi Seçin</Label>
									<Combobox
										items={treatmentOptions}
										value={selectedTreatmentId}
										onChange={handleTreatmentChange}
										placeholder="Ek tedavi seçin..."
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Adet</Label>
										<Input
											type="number"
											min={1}
											value={quantity === undefined ? "" : quantity}
											onChange={(e) => {
												const val = e.target.value;
												if (val === "") {
													setQuantity(undefined);
												} else {
													const num = Number(val);
													setQuantity(num > 0 ? num : undefined);
												}
											}}
										/>
									</div>
									{!hideUnitPriceInput && (
										<div className="space-y-2">
											<Label>Birim Fiyat</Label>
											<Input
												type="number"
												placeholder="0"
												value={price || ""}
												onChange={(e) => setPrice(Number(e.target.value) || undefined)}
											/>
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label>Notlar (Opsiyonel)</Label>
									<Textarea
										placeholder="Ek açıklama..."
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										rows={3}
									/>
								</div>

								<div className="flex items-center gap-3 pt-4">
									<Button
										variant="outline"
										onClick={() => setIsOpen(false)}
										className="flex-1"
									>
										<X className="w-4 h-4 mr-2" />
										İptal
									</Button>
									<Button
										onClick={handleAddTreatment}
										disabled={addTreatmentMutation.isPending || !selectedTreatmentId}
										className="flex-1 bg-green-600 hover:bg-green-700"
									>
										<Save className="w-4 h-4 mr-2" />
										{addTreatmentMutation.isPending ? "Ekleniyor..." : "Ekle"}
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

			</CardContent>
		</Card>
	);
}