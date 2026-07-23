"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	amount: z
		.string()
		.min(1, "Miktar gereklidir")
		.refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
			message: "Geçerli bir miktar giriniz",
		}),
	clinicId: z.string().min(1, "Klinik seçimi gereklidir"),
  dentistId: z.string().min(1, "Hekim seçimi zorunludur"),
	description: z.string().optional(),
	paymentType: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER"]),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
	isOpen: boolean;
	onClose: () => void;
	selectedDate: Date;
	onSuccess: () => void;
};

export default function AddIncomeModal({ isOpen, onClose, selectedDate, onSuccess }: Props) {
	const [showExcessPaymentModal, setShowExcessPaymentModal] = useState(false);
	const [debtCheckData, setDebtCheckData] = useState<any>(null);
	const [pendingFormValues, setPendingFormValues] = useState<FormValues | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "",
			clinicId: "",
			dentistId: "",
			description: "",
			paymentType: "CASH",
		},
	});

	const selectedClinicId = form.watch("clinicId");
	const selectedDentistId = form.watch("dentistId");
	const amount = form.watch("amount");

	const { data: clinics } = api.admin.dailyCashBox.getClinics.useQuery({});
	const { data: dentists } = api.admin.dentist.getAll.useQuery({ perPage: 0 });
	const { data: clinicPaymentDetail } = api.admin.payment.getClinicPaymentDetail.useQuery(
		{ clinicId: selectedClinicId },
		{ enabled: !!selectedClinicId }
	);

	const checkDebtMutation = api.admin.dailyCashBox.checkDebt.useQuery(
		{
			clinicId: selectedClinicId,
			dentistId: selectedDentistId!,
			amount: Number(amount) || 0,
		},
		{
			enabled: false, // Manuel olarak tetikleyeceğiz
		}
	);

	const createIncomeMutation = api.admin.dailyCashBox.createIncome.useMutation({
		onSuccess: () => {
			toast.success("Gelir başarıyla eklendi");
			form.reset();
			setShowExcessPaymentModal(false);
			setPendingFormValues(null);
			setDebtCheckData(null);
			onSuccess();
		},
		onError: (error) => {
			toast.error(error.message || "Gelir eklenirken hata oluştu");
		},
	});

	useEffect(() => {
		if (!isOpen) {
			form.reset();
			setShowExcessPaymentModal(false);
			setPendingFormValues(null);
			setDebtCheckData(null);
		}
	}, [isOpen, form]);

	const onSubmit = async (values: FormValues) => {
		// Eğer doktor seçilmişse borç kontrolü yap
		if (values.dentistId) {
			try {
				const debtCheck = await checkDebtMutation.refetch();
				if (debtCheck.data?.needsConfirmation) {
					// Fazla ödeme var, onay modalını göster
					setDebtCheckData(debtCheck.data);
					setPendingFormValues(values);
					setShowExcessPaymentModal(true);
					return;
				}
			} catch (error) {
				toast.error("Borç kontrolü yapılırken hata oluştu");
				return;
			}
		}

		// Normal gelir ekleme
		createIncomeMutation.mutate({
			amount: Number(values.amount),
			clinicId: values.clinicId,
			dentistId: values.dentistId || undefined,
			description: values.description || undefined,
			paymentType: values.paymentType,
			date: selectedDate,
			confirmExcessPayment: false,
		});
	};

	const handleExcessPaymentConfirm = () => {
		if (!pendingFormValues) return;

		createIncomeMutation.mutate({
			amount: Number(pendingFormValues.amount),
			clinicId: pendingFormValues.clinicId,
			dentistId: pendingFormValues.dentistId || undefined,
			description: pendingFormValues.description || undefined,
			paymentType: pendingFormValues.paymentType,
			date: selectedDate,
			confirmExcessPayment: true,
		});
	};

	const filteredDentists = selectedClinicId
		? dentists?.filter((dentist) => dentist.clinicId === selectedClinicId)
		: dentists;

	// seçili şubenin borç kısmı burda bu hekimlerdeki gibi parantezdede yazmalı daha seçmeden önce 
	const clinicDebtText = (() => {
		if (!selectedClinicId || !clinicPaymentDetail) return null;
		const remainingDebt = clinicPaymentDetail.summary.remainingDebt;
		const formattedAmount = Math.abs(remainingDebt).toLocaleString("tr-TR");
		if (remainingDebt > 0) return `Şube Toplam Borcu: ${formattedAmount} ₺`;
		if (remainingDebt < 0) return `Şube ${formattedAmount} ₺ Alacaklı`;
		return "Şube Borçsuz";
	})();

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
		<>
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<DollarSign className="w-5 h-5 mr-2 text-green-600" />
						Gelir Ekle
					</DialogTitle>
					<DialogDescription>Yeni gelir kaydı ekleyin. Klinik seçimi zorunludur.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Miktar *</FormLabel>
									<FormControl>
										<FormattedNumberInput
											placeholder="0"
											value={field.value}
											onChange={field.onChange}
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
									<FormLabel>Klinik *</FormLabel>
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
									{clinicDebtText && (
										<p
											className={`text-xs font-medium ${
												clinicPaymentDetail && clinicPaymentDetail.summary.remainingDebt > 0
													? "text-red-600"
													: "text-green-600"
											}`}
										>
											{clinicDebtText}
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						   <FormField
								control={form.control}
								name="dentistId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hekim *</FormLabel>
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Not (Opsiyonel)</FormLabel>
									<FormControl>
										<Textarea placeholder="Gelir açıklaması..." {...field} />
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

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={createIncomeMutation.isPending}>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={createIncomeMutation.isPending}
								className="bg-green-600 hover:bg-green-700"
							>
								{createIncomeMutation.isPending ? "Ekleniyor..." : "Gelir Ekle"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>

		{/* Fazla Ödeme Onay Modalı */}
		<Dialog open={showExcessPaymentModal} onOpenChange={setShowExcessPaymentModal}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-amber-600">
						<AlertTriangle className="h-5 w-5" />
						Fazla Ödeme Uyarısı
					</DialogTitle>
					<DialogDescription>
						Bu ödeme hekim borcundan fazla. Devam etmek istediğinizden emin misiniz?
					</DialogDescription>
				</DialogHeader>

				{debtCheckData && (
					<div className="space-y-3 py-4">
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="text-muted-foreground">Hekim:</div>
							<div className="font-medium">{debtCheckData.dentistName}</div>
							
							<div className="text-muted-foreground">Toplam Borç:</div>
							<div>{debtCheckData.totalDebt.toLocaleString('tr-TR')} ₺</div>
							
							<div className="text-muted-foreground">Ödenen Toplam:</div>
							<div>{debtCheckData.totalIncomes.toLocaleString('tr-TR')} ₺</div>
							
							<div className="text-muted-foreground">
								{debtCheckData.remainingDebt > 0 ? 'Kalan Borç:' : 'Alacak Durumu:'}
							</div>
							<div className={`font-medium ${debtCheckData.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
								{debtCheckData.remainingDebt > 0 
									? `${debtCheckData.remainingDebt.toLocaleString('tr-TR')} ₺` 
									: `${Math.abs(debtCheckData.remainingDebt).toLocaleString('tr-TR')} ₺ Alacaklı`
								}
							</div>
							
							<div className="text-muted-foreground">Ödeme Tutarı:</div>
							<div className="font-medium">{debtCheckData.paymentAmount.toLocaleString('tr-TR')} ₺</div>
							
							<div className="text-muted-foreground">
								{debtCheckData.remainingDebt > 0 ? 'Fazla Tutar:' : 'Ek Alacak:'}
							</div>
							<div className="font-semibold text-amber-600">
								{debtCheckData.excessAmount.toLocaleString('tr-TR')} ₺
							</div>
						</div>
						
						<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
							<p className="text-sm text-amber-800">
								<strong>Uyarı:</strong> {debtCheckData.remainingDebt > 0 
									? 'Bu ödeme ile hekim alacaklı duruma geçecektir.' 
									: 'Bu ödeme ile hekimin alacağı artacaktır.'
								}
							</p>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button 
						type="button" 
						variant="outline" 
						onClick={() => setShowExcessPaymentModal(false)}
						disabled={createIncomeMutation.isPending}
					>
						İptal
					</Button>
					<Button
						onClick={handleExcessPaymentConfirm}
						disabled={createIncomeMutation.isPending}
						className="bg-amber-600 hover:bg-amber-700"
					>
						{createIncomeMutation.isPending ? "Ekleniyor..." : "Onayla ve Devam Et"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
	);
}
