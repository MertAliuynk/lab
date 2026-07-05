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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
	clinicId: string;
	clinicName: string;
};

type PriceData = {
	prosthesisTypeId: string;
	prosthesisTypeName: string;
	price: number;
	defaultPrice: number | null;
};

export default function UpdateClinicPrices({ clinicId, clinicName }: Props) {
	const [open, setOpen] = useState(false);
	const [prices, setPrices] = useState<PriceData[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const { data: clinicPrices, refetch } = api.admin.clinic.getClinicPrices.useQuery({ clinicId }, { enabled: open });

	const updatePricesMutation = api.admin.clinic.updateClinicPrices.useMutation({
		onSuccess: () => {
			toast.success("Fiyatlar başarıyla güncellendi");
			setOpen(false);
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Fiyatlar güncellenirken hata oluştu");
		},
	});

	useEffect(() => {
		if (clinicPrices) {
			setPrices(
				clinicPrices.map((item) => ({
					prosthesisTypeId: item.prosthesisTypeId,
					prosthesisTypeName: item.prosthesisType.name,
					price: item.price,
					defaultPrice: item.prosthesisType.defaultPrice,
				})),
			);
		}
	}, [clinicPrices]);

	const handlePriceChange = (prosthesisTypeId: string, newPrice: string) => {
		const numericPrice = newPrice === "" ? 0 : Number(newPrice);
		if (Number.isNaN(numericPrice) || numericPrice < 0) return;

		setPrices((prev) =>
			prev.map((item) => (item.prosthesisTypeId === prosthesisTypeId ? { ...item, price: numericPrice } : item)),
		);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			await updatePricesMutation.mutateAsync({
				clinicId,
				prices: prices.map((item) => ({
					prosthesisTypeId: item.prosthesisTypeId,
					price: item.price,
				})),
			});
		} finally {
			setIsLoading(false);
		}
	};

	const resetToDefaults = () => {
		setPrices((prev) =>
			prev.map((item) => ({
				...item,
				price: item.defaultPrice || 0,
			})),
		);
		toast.info("Tüm fiyatlar varsayılan değerlere sıfırlandı");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Fiyat Listesi Güncelle</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Fiyat Listesi Güncelle</DialogTitle>
					<DialogDescription>{clinicName} kliniği için protez türü fiyatlarını güncelleyin.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{prices.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin" />
							<span className="ml-2">Fiyatlar yükleniyor...</span>
						</div>
					) : (
						<>
							<div className="flex justify-between items-center">
								<p className="text-sm text-muted-foreground">{prices.length} protez türü bulundu</p>
								<Button type="button" variant="outline" size="sm" onClick={resetToDefaults} disabled={isLoading}>
									Varsayılanlara Sıfırla
								</Button>
							</div>

							<div className="grid gap-4">
								{prices.map((item) => (
									<div key={item.prosthesisTypeId} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex-1">
											<Label className="font-medium">{item.prosthesisTypeName}</Label>
											{item.defaultPrice && (
												<p className="text-xs text-muted-foreground mt-1">
													Varsayılan: ₺{item.defaultPrice.toLocaleString("tr-TR")}
												</p>
											)}
										</div>
										<div className="w-32">
											<div className="relative">
												<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
													₺
												</span>
												<Input
													type="number"
													min="0"
													step="1"
													value={item.price}
													onChange={(e) => handlePriceChange(item.prosthesisTypeId, e.target.value)}
													className="pl-8"
													disabled={isLoading}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
						İptal
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={isLoading || prices.length === 0}>
						{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						Kaydet
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
