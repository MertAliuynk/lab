"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { api } from "@/trpc/react";
import { ArrowLeftRight, ArrowRightLeft, Calculator, Info, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
	clinicId: string;
	dentistSummaries: Array<{
		id: string;
		name: string;
		workCount: number;
		totalDebt: number;
		totalReceived: number;
		remainingDebt: number;
		paymentRate: number;
	}>;
	onSuccess?: () => void;
}

export default function DebtTransferModal({ clinicId, dentistSummaries, onSuccess }: Props) {
	const [open, setOpen] = useState(false);
	const [fromDentistId, setFromDentistId] = useState<string>("");
	const [toDentistId, setToDentistId] = useState<string>("");
	const [amount, setAmount] = useState<string>("");
	const [description, setDescription] = useState<string>("");

	const transferMutation = api.admin.payment.transferDebt.useMutation({
		onSuccess: (result) => {
			toast.success(
				`Borç aktarımı başarılı: ${formatCurrency(result.amount)} - ${result.fromDentist} → ${result.toDentist}`,
			);
			setOpen(false);
			resetForm();
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const resetForm = () => {
		setFromDentistId("");
		setToDentistId("");
		setAmount("");
		setDescription("");
	};

	const fromDentist = dentistSummaries.find((d) => d.id === fromDentistId);
	const toDentist = dentistSummaries.find((d) => d.id === toDentistId);

	const maxTransferAmount = fromDentist ? Math.abs(fromDentist.remainingDebt) : 0;
	const transferAmount = parseFloat(amount) || 0;
	const isValidTransfer = transferAmount > 0 && transferAmount <= maxTransferAmount;

	const canTransfer = fromDentistId && toDentistId && fromDentistId !== toDentistId && isValidTransfer;

	const handleTransfer = () => {
		if (!canTransfer) return;

		transferMutation.mutate({
			clinicId,
			fromDentistId,
			toDentistId,
			amount: transferAmount,
			description: description || undefined,
		});
	};

	const getScenarioText = () => {
		if (!fromDentist) return "";
		
		if (fromDentist.remainingDebt > 0) {
			return "Borçlu hekim → Diğer hekime borç aktarımı";
		} else {
			return "Alacaklı hekim → Diğer hekimin borcunu silme";
		}
	};

	const getScenarioColor = () => {
		if (!fromDentist) return "text-gray-600";
		
		return fromDentist.remainingDebt > 0 ? "text-orange-600" : "text-green-600";
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<ArrowLeftRight className="h-4 w-4" />
					Borç Aktar
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ArrowRightLeft className="h-5 w-5" />
						Hekimler Arası Borç Aktarımı
					</DialogTitle>
					<DialogDescription>
						Hekimler arasında borç aktarımı yapın. Borçlu hekimden borç aktarabilir veya alacaklı hekimle borç
						silebilirsiniz.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Hekim Seçimi */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="fromDentist">Aktaran Hekim</Label>
							<Select value={fromDentistId} onValueChange={setFromDentistId}>
								<SelectTrigger>
									<SelectValue placeholder="Hekim seçin" />
								</SelectTrigger>
								<SelectContent>
									{dentistSummaries.map((dentist) => (
										<SelectItem key={dentist.id} value={dentist.id}>
											<div className="flex items-center justify-between w-full">
												<span>{dentist.name}</span>
												<span className={`text-sm ${dentist.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
													{formatCurrency(dentist.remainingDebt)}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="toDentist">Hedef Hekim</Label>
							<Select value={toDentistId} onValueChange={setToDentistId}>
								<SelectTrigger>
									<SelectValue placeholder="Hekim seçin" />
								</SelectTrigger>
								<SelectContent>
									{dentistSummaries
										.filter((dentist) => dentist.id !== fromDentistId)
										.map((dentist) => (
											<SelectItem key={dentist.id} value={dentist.id}>
												<div className="flex items-center justify-between w-full">
													<span>{dentist.name}</span>
													<span className={`text-sm ${dentist.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
														{formatCurrency(dentist.remainingDebt)}
													</span>
												</div>
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Durum Bilgisi */}
					{fromDentist && toDentist && (
						<Card className="border-dashed">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<Calculator className="h-4 w-4" />
									İşlem Özeti
								</CardTitle>
								<CardDescription className={getScenarioColor()}>
									{getScenarioText()}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="text-center p-3 bg-blue-50 rounded-lg">
										<p className="text-sm text-gray-600">Aktaran</p>
										<p className="font-medium">{fromDentist.name}</p>
										<p className={`text-sm ${fromDentist.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
											{formatCurrency(fromDentist.remainingDebt)}
										</p>
									</div>
									<div className="text-center p-3 bg-purple-50 rounded-lg">
										<p className="text-sm text-gray-600">Hedef</p>
										<p className="font-medium">{toDentist.name}</p>
										<p className={`text-sm ${toDentist.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
											{formatCurrency(toDentist.remainingDebt)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Miktar */}
					<div className="space-y-2">
						<Label htmlFor="amount">Aktarılacak Miktar</Label>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="0"
								max={maxTransferAmount}
								step="0.01"
							/>
							{fromDentist && (
								<div className="absolute right-3 top-2.5 text-sm text-gray-500">
									Max: {formatCurrency(maxTransferAmount)}
								</div>
							)}
						</div>
						{transferAmount > maxTransferAmount && (
							<p className="text-sm text-red-600 flex items-center gap-1">
								<Info className="h-3 w-3" />
								Maksimum aktarılabilir miktar: {formatCurrency(maxTransferAmount)}
							</p>
						)}
					</div>

					{/* Açıklama */}
					<div className="space-y-2">
						<Label htmlFor="description">Açıklama (Opsiyonel)</Label>
						<Textarea
							id="description"
							placeholder="İşlem açıklaması..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Preview */}
					{canTransfer && (
						<Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Users className="h-5 w-5 text-green-600" />
										<div>
											<p className="font-medium">{fromDentist?.name} → {toDentist?.name}</p>
											<p className="text-sm text-gray-600">
												{getScenarioText()}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold text-green-700">{formatCurrency(transferAmount)}</p>
										<p className="text-sm text-gray-600">Aktarım Tutarı</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<Separator />

					{/* Buttons */}
					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => setOpen(false)}>
							İptal
						</Button>
						<Button 
							onClick={handleTransfer} 
							disabled={!canTransfer || transferMutation.isPending}
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
						>
							{transferMutation.isPending ? "Aktarılıyor..." : "Borç Aktar"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}