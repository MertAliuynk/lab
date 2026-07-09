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
import { Minus } from "lucide-react";
import { useEffect } from "react";
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
	description: z.string(),
	paymentType: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER"]),
	expenseTypeId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
	isOpen: boolean;
	onClose: () => void;
	selectedDate: Date;
	onSuccess: () => void;
};

export default function AddExpenseModal({ isOpen, onClose, selectedDate, onSuccess }: Props) {
	const expenseTypesQuery = api.admin.dailyCashBox.getAllExpenseTypes.useQuery();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "",
			description: "",
			paymentType: "CASH",
			expenseTypeId: "",
		},
	});

	const createExpenseMutation = api.admin.dailyCashBox.createExpense.useMutation({
		onSuccess: () => {
			toast.success("Gider başarıyla eklendi");
			form.reset();
			onSuccess();
		},
		onError: (error) => {
			toast.error(error.message || "Gider eklenirken hata oluştu");
		},
	});

	useEffect(() => {
		if (!isOpen) {
			form.reset();
		}
	}, [isOpen, form]);

	const onSubmit = (values: FormValues) => {
		createExpenseMutation.mutate({
			amount: Number(values.amount),
			description: values.description,
			paymentType: values.paymentType,
			date: selectedDate,
			expenseTypeId: values.expenseTypeId,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Minus className="w-5 h-5 mr-2 text-red-600" />
						Gider Ekle
					</DialogTitle>
					<DialogDescription>Yeni gider kaydı ekleyin.</DialogDescription>
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Açıklama *</FormLabel>
									<FormControl>
										<Textarea placeholder="Gider açıklaması..." {...field} />
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
							name="expenseTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Gider Türü *</FormLabel>
									<FormControl>
										<Combobox
											value={field.value}
											onChange={field.onChange}
											items={expenseTypesQuery.data?.map((et) => ({ id: et.id, name: et.name })) || []}
											placeholder="Gider türü seçin"
											isDisabled={expenseTypesQuery.isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={createExpenseMutation.isPending}>
								İptal
							</Button>
							<Button type="submit" disabled={createExpenseMutation.isPending} variant="destructive">
								{createExpenseMutation.isPending ? "Ekleniyor..." : "Gider Ekle"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
