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
import { updateSchema } from "@/server/api/routers/admin/technician-stage/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PageProps = { data: RouterOutputs["admin"]["technicianStage"]["getAll"][number] };

export default function EditTechnicianStage({ data }: PageProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updateTechnicianStage, isPending } = api.admin.technicianStage.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: data.id,
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (data) {
			form.setValue("name", data.name);
			form.setValue("description", data.description ?? "");
		}
	}, [data, form]);

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updateTechnicianStage(values).then(() => {
				setIsOpen(false);
				router.refresh();
				form.reset();
			}),
			{
				loading: "Teknisyen aşaması güncelleniyor...",
				success: "Teknisyen aşaması güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Teknisyen aşaması güncellenirken bir hata oluştu</p>
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
						<Badge variant="blue">{data.name}</Badge> Adlı Teknisyen Aşamasını Düzenle
					</DialogTitle>
					<DialogDescription>
						Bu sayfada teknisyen aşaması bilgilerini güncelleyebilirsiniz. Formu doldurduktan sonra{" "}
						<Badge>Güncelle</Badge> butonuna tıklayın veya işlemi iptal etmek isterseniz{" "}
						<Badge variant="outline">İptal</Badge> butonuna tıklayarak değişiklikleri iptal edebilirsiniz.
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

						<div className="grid grid-cols-[1fr_2fr] gap-2">
							<Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
								İptal
							</Button>
							<Button type="submit" loading={isPending}>
								Güncelle
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}