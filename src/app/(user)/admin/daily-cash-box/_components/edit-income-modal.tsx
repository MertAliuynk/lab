"use client";

import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editIncomeSchema = z.object({
	amount: z.number().positive("Miktar pozitif olmalıdır"),
	description: z.string().optional(),
	clinicId: z.string().min(1, "Klinik seçiniz"),
	dentistId: z.string().optional(),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]),
});

type EditIncomeFormData = z.infer<typeof editIncomeSchema>;

interface EditIncomeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	income: {
		id: string;
		amount: number;
		description?: string | null;
		clinicId: string;
		dentistId?: string | null;
		paymentType: string;
	} | null;
}

export default function EditIncomeModal({ isOpen, onClose, onSuccess, income }: EditIncomeModalProps) {
	const form = useForm<EditIncomeFormData>({
		resolver: zodResolver(editIncomeSchema),
		defaultValues: {
			amount: 0,
			description: "",
			clinicId: "",
			dentistId: "",
			paymentType: "CASH",
		},
	});

	const selectedClinicId = form.watch("clinicId");

	const { data: clinics } = api.admin.dailyCashBox.getClinics.useQuery({});
	const { data: dentists } = api.admin.dentist.getAll.useQuery({ perPage: 0 });
	const { data: clinicPaymentDetail } = api.admin.payment.getClinicPaymentDetail.useQuery(
		{ clinicId: selectedClinicId },
		{ enabled: !!selectedClinicId }
	);

	const updateIncomeMutation = api.admin.dailyCashBox.updateIncome.useMutation({
		onSuccess: () => {
			toast.success("Gelir başarıyla güncellendi");
			form.reset();
			onSuccess();
		},
		onError: (error) => {
			toast.error(error.message || "Gelir güncellenirken hata oluştu");
		},
	});

	useEffect(() => {
		if (income && isOpen) {
			form.reset({
				amount: Number(income.amount),
				description: income.description || "",
				clinicId: income.clinicId,
				dentistId: income.dentistId || "",
				paymentType: income.paymentType as "BANK_TRANSFER" | "CREDIT_CARD" | "CASH",
			});
		}
	}, [income, isOpen, form]);

	const handleSubmit = (data: EditIncomeFormData) => {
		if (!income) return;

		const updateData = {
			id: income.id,
			amount: data.amount,
			description: data.description,
			clinicId: data.clinicId,
			paymentType: data.paymentType,
			...(data.dentistId ? { dentistId: data.dentistId } : {}),
		};

		updateIncomeMutation.mutate(updateData);
	};

	const handleClose = () => {
		form.reset();
		onClose();
	};

	const filteredDentists = selectedClinicId
		? dentists?.filter((dentist) => dentist.clinicId === selectedClinicId)
		: dentists;

	// Doktor isimlerine kalan borç/alacak bilgisini ekle
	const dentistsWithDebt = filteredDentists?.map((dentist) => {
		const dentistDebt = clinicPaymentDetail?.dentistSummaries?.find(
			(summary) => summary.id === dentist.id
		);
		const remainingDebt = dentistDebt?.remainingDebt || 0;
		const formattedAmount = Math.abs(remainingDebt).toLocaleString('tr-TR');
		
		let statusText = '';
		if (remainingDebt > 0) {
			statusText = `(Kalan Borç: ${formattedAmount} ₺)`;
		} else if (remainingDebt < 0) {
			statusText = `(${formattedAmount} ₺ Alacaklı)`;
		} else {
			statusText = '(Borçsuz)';
		}
		
		return {
			id: dentist.id,
			name: `${dentist.user.name} ${statusText}`,
		};
	}) || [];

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5 text-green-600" />
						Gelir Düzenle
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Miktar (₺)</FormLabel>
									<FormControl>
										<FormattedNumberInput
											value={field.value}
											onChange={(value) => field.onChange(Number(value))}
											returnType="number"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="clinicId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Klinik</FormLabel>
									<FormControl>
										<Combobox
											items={
												clinics?.map((clinic) => ({
													id: clinic.id,
													name: clinic.name,
												})) ?? []
											}
											value={field.value}
											onChange={field.onChange}
											placeholder="Klinik seçiniz"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dentistId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hekim (Opsiyonel)</FormLabel>
									<FormControl>
										<Combobox
											items={dentistsWithDebt}
											value={field.value || ""}
											onChange={field.onChange}
											placeholder="Hekim seçiniz"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="paymentType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ödeme Türü</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="CASH">Nakit</SelectItem>
											<SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
											<SelectItem value="BANK_TRANSFER">Havale</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Açıklama (Opsiyonel)</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-2 justify-end pt-4">
							<Button type="button" variant="outline" onClick={handleClose}>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={updateIncomeMutation.isPending}
								className="bg-green-600 hover:bg-green-700"
							>
								{updateIncomeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Güncelle
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
