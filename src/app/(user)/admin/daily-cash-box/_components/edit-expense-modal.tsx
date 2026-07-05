"use client";

import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editExpenseSchema = z.object({
	amount: z.number().positive("Miktar pozitif olmalıdır"),
	description: z.string().min(1, "Açıklama gereklidir"),
	paymentType: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH"]),
});

type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

interface EditExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	expense: {
		id: string;
		amount: number;
		description: string;
		paymentType: string;
	} | null;
}

export default function EditExpenseModal({ isOpen, onClose, onSuccess, expense }: EditExpenseModalProps) {
	const form = useForm<EditExpenseFormData>({
		resolver: zodResolver(editExpenseSchema),
		defaultValues: {
			amount: 0,
			description: "",
			paymentType: "CASH",
		},
	});

	const updateExpenseMutation = api.admin.dailyCashBox.updateExpense.useMutation({
		onSuccess: () => {
			toast.success("Gider başarıyla güncellendi");
			form.reset();
			onSuccess();
		},
		onError: (error) => {
			toast.error(error.message || "Gider güncellenirken hata oluştu");
		},
	});

	useEffect(() => {
		if (expense && isOpen) {
			form.reset({
				amount: Number(expense.amount),
				description: expense.description,
				paymentType: expense.paymentType as "BANK_TRANSFER" | "CREDIT_CARD" | "CASH",
			});
		}
	}, [expense, isOpen, form]);

	const handleSubmit = (data: EditExpenseFormData) => {
		if (!expense) return;

		updateExpenseMutation.mutate({
			id: expense.id,
			...data,
		});
	};

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Minus className="h-5 w-5 text-red-600" />
						Gider Düzenle
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Açıklama</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} />
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

						<div className="flex gap-2 justify-end pt-4">
							<Button type="button" variant="outline" onClick={handleClose}>
								İptal
							</Button>
							<Button type="submit" disabled={updateExpenseMutation.isPending} variant="destructive">
								{updateExpenseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Güncelle
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
