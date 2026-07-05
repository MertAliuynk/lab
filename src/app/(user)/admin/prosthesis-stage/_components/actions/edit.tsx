"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSchema } from "@/server/api/routers/admin/prosthesis-stage/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PageProps = { data: RouterOutputs["admin"]["prosthesisStage"]["getAll"][number] };

export default function EditProsthesisStage({ data }: PageProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updateProsthesisStage, isPending } = api.admin.prosthesisStage.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: data.id,
			name: "",
			description: "",
			percentage: 0,
			price: 0,
		},
	});

	useEffect(() => {
		if (data) {
			form.setValue("name", data.name);
			form.setValue("description", data.description ?? "");
			form.setValue("percentage", data.percentage ?? 0);
			form.setValue("price", data.price ?? 0);
		}
	}, [data, form]);

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updateProsthesisStage(values).then(() => {
				setIsOpen(false);
				router.refresh();
				form.reset();
			}),
			{
				loading: "Protez aşaması güncelleniyor...",
				success: "Protez aşaması güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Protez aşaması güncellenirken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem modal>Düzenle</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Düzenle <Badge variant="green">Protez Aşaması</Badge>
					</DialogTitle>
					<DialogDescription>
						Protez aşamasını düzenlemek için aşağıdaki formu doldurun ve <Badge>Kaydet</Badge> butonuna tıklayın veya
						işlemi iptal etmek isterseniz <Badge variant="outline">İptal</Badge> butonuna tıklayarak işlemi iptal
						edebilirsiniz.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Aşama Adı</FormLabel>
									<FormControl>
										<Input placeholder="Aşama adı giriniz" {...field} />
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
										<Textarea placeholder="Açıklama" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="percentage"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Yüzde (%)</FormLabel>
									<FormControl>
										<Input
											placeholder="0-100"
											{...field}
											value={field.value === 0 ? "" : field.value}
											onChange={(e) => {
												const value = e.target.value.replace(/[^0-9]/g, "");
												field.onChange(Number(value));
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Fiyat (₺)</FormLabel>
									<FormControl>
										<Input
											prefix="₺"
											placeholder="Fiyat giriniz"
											{...field}
											value={field.value === 0 ? "" : field.value.toLocaleString("tr-TR")}
											onChange={(e) => {
												const value = e.target.value.replace(/[^0-9]/g, "");
												field.onChange(Number(value));
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-[1fr_2fr] gap-2">
							<Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
								İptal
							</Button>
							<Button type="submit" loading={isPending}>
								Kaydet
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
