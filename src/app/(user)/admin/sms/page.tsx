"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Globe, MessageSquare, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const smsFormSchema = z.object({
	message: z.string().min(1, "Mesaj içeriği zorunludur").max(160, "Mesaj 160 karakterden uzun olamaz"),
	recipientType: z.enum(["single", "multiple", "clinic", "all"]),
	phoneNumber: z.string().optional(),
	phoneNumbers: z.array(z.string()).optional(),
	clinicId: z.string().optional(),
});

type SmsFormValues = z.infer<typeof smsFormSchema>;

export default function SmsPage() {
	const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
	const [currentPhone, setCurrentPhone] = useState("");

	const { data: clinics, isLoading: clinicsLoading } = api.admin.clinic.getAll.useQuery({});
	const sendSmsMutation = api.sms.send.useMutation({
		onSuccess: (data) => {
			toast.success(`SMS başarıyla gönderildi! ${data.sentCount} kişiye ulaştı.`);
			form.reset({
				message: "",
				recipientType: "single",
				phoneNumber: "",
				phoneNumbers: [],
				clinicId: "",
			});
			setPhoneNumbers([]);
			setCurrentPhone("");
		},
		onError: (error) => {
			toast.error(error.message || "SMS gönderilirken bir hata oluştu");
		},
	});

	const form = useForm<SmsFormValues>({
		resolver: zodResolver(smsFormSchema),
		defaultValues: {
			message: "",
			recipientType: "single",
			phoneNumber: "",
			phoneNumbers: [],
			clinicId: "",
		},
	});

	const recipientType = form.watch("recipientType");

	const handleAddPhone = () => {
		if (currentPhone && currentPhone.length >= 10 && !phoneNumbers.includes(currentPhone)) {
			setPhoneNumbers([...phoneNumbers, currentPhone]);
			setCurrentPhone("");
		}
	};

	const handleRemovePhone = (phone: string) => {
		setPhoneNumbers(phoneNumbers.filter((p) => p !== phone));
	};

	const handleSubmit = (data: SmsFormValues) => {
		let recipients:
			| {
					type: "single";
					phoneNumber: string;
			  }
			| {
					type: "multiple";
					phoneNumbers: string[];
			  }
			| {
					type: "clinic";
					clinicId: string;
			  }
			| {
					type: "all";
			  };

		switch (data.recipientType) {
			case "single":
				if (!data.phoneNumber) {
					toast.error("Telefon numarası gereklidir");
					return;
				}
				recipients = {
					type: "single" as const,
					phoneNumber: data.phoneNumber,
				};
				break;
			case "multiple":
				if (phoneNumbers.length === 0) {
					toast.error("En az bir telefon numarası ekleyiniz");
					return;
				}
				recipients = {
					type: "multiple" as const,
					phoneNumbers: phoneNumbers,
				};
				break;
			case "clinic":
				if (!data.clinicId) {
					toast.error("Klinik seçimi gereklidir");
					return;
				}
				recipients = {
					type: "clinic" as const,
					clinicId: data.clinicId,
				};
				break;
			case "all":
				recipients = {
					type: "all" as const,
				};
				break;
		}

		sendSmsMutation.mutate({
			message: data.message,
			recipients,
		});
	};

	return (
		<div>
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-lg font-semibold text-gray-700 mb-2">SMS Gönderimi</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-green-500 to-purple-500 rounded-full mx-auto" />
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>SMS Gönderimi</CardTitle>
					<CardDescription>Mesajınızı yazın ve alıcıları seçin</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mesaj İçeriği</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Mesajınızı buraya yazın..."
												className="min-h-[120px] resize-none"
												maxLength={160}
												{...field}
											/>
										</FormControl>
										<div className="flex justify-between text-sm text-muted-foreground">
											<span>Maksimum 160 karakter</span>
											<span>{field.value?.length || 0}/160</span>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="recipientType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Alıcı Türü</FormLabel>
										<FormControl>
											<div className="grid grid-cols-2 gap-4">
												<div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
													<input
														type="radio"
														value="single"
														id="single"
														checked={field.value === "single"}
														onChange={() => field.onChange("single")}
														className="w-4 h-4"
													/>
													<Label htmlFor="single" className="flex items-center gap-2 cursor-pointer">
														<MessageSquare className="w-4 h-4" />
														Tekil SMS
													</Label>
												</div>
												<div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
													<input
														type="radio"
														value="multiple"
														id="multiple"
														checked={field.value === "multiple"}
														onChange={() => field.onChange("multiple")}
														className="w-4 h-4"
													/>
													<Label htmlFor="multiple" className="flex items-center gap-2 cursor-pointer">
														<Users className="w-4 h-4" />
														Çoklu SMS
													</Label>
												</div>
												<div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
													<input
														type="radio"
														value="clinic"
														id="clinic"
														checked={field.value === "clinic"}
														onChange={() => field.onChange("clinic")}
														className="w-4 h-4"
													/>
													<Label htmlFor="clinic" className="flex items-center gap-2 cursor-pointer">
														<Building2 className="w-4 h-4" />
														Klinik SMS
													</Label>
												</div>
												<div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
													<input
														type="radio"
														value="all"
														id="all"
														checked={field.value === "all"}
														onChange={() => field.onChange("all")}
														className="w-4 h-4"
													/>
													<Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
														<Globe className="w-4 h-4" />
														Tüm Kullanıcılar
													</Label>
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{recipientType === "single" && (
								<FormField
									control={form.control}
									name="phoneNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Telefon Numarası</FormLabel>
											<FormControl>
												<Input placeholder="05XX XXX XX XX" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{recipientType === "multiple" && (
								<div className="space-y-4">
									<FormLabel>Telefon Numaraları</FormLabel>
									<div className="flex gap-2">
										<Input
											placeholder="05XX XXX XX XX"
											value={currentPhone}
											onChange={(e) => setCurrentPhone(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleAddPhone();
												}
											}}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleAddPhone}
											disabled={!currentPhone || currentPhone.length < 10}
										>
											<Plus className="w-4 h-4" />
										</Button>
									</div>

									{phoneNumbers.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{phoneNumbers.map((phone) => (
												<Badge key={phone} variant="secondary" className="flex items-center gap-1">
													{phone}
													<X
														className="w-3 h-3 cursor-pointer hover:text-destructive"
														onClick={() => handleRemovePhone(phone)}
													/>
												</Badge>
											))}
										</div>
									)}
								</div>
							)}

							{recipientType === "clinic" && (
								<FormField
									control={form.control}
									name="clinicId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Klinik Seçimi</FormLabel>
											<FormControl>
												<Select onValueChange={field.onChange} value={field.value}>
													<SelectTrigger>
														<SelectValue placeholder="Klinik seçiniz" />
													</SelectTrigger>
													<SelectContent>
														{clinicsLoading ? (
															<SelectItem value="" disabled>
																Yükleniyor...
															</SelectItem>
														) : (
															clinics?.map((clinic) => (
																<SelectItem key={clinic.id} value={clinic.id}>
																	{clinic.name}
																</SelectItem>
															))
														)}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{recipientType === "all" && (
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										Bu seçenek sistemdeki tüm hekimlere, klinik yöneticilerine ve teknisyenlere SMS gönderecektir.
									</p>
								</div>
							)}

							<Button type="submit" className="w-full" disabled={sendSmsMutation.isPending}>
								{sendSmsMutation.isPending ? "Gönderiliyor..." : "SMS Gönder"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
