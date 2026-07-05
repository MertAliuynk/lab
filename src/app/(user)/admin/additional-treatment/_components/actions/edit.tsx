"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
import { updateSchema } from "@/server/api/routers/admin/additional-treatment/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PageProps = { additionalTreatment: RouterOutputs["admin"]["additionalTreatment"]["getAll"][number] };

export default function EditAdditionalTreatment({ additionalTreatment }: PageProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updateAdditionalTreatment, isPending } = api.admin.additionalTreatment.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: additionalTreatment.id,
			name: "",
			description: "",
			defaultPrice: 0,
		},
	});

	useEffect(() => {
		if (additionalTreatment) {
			form.setValue("name", additionalTreatment.name);
			form.setValue("description", additionalTreatment.description ?? "");
			form.setValue("defaultPrice", additionalTreatment.defaultPrice ?? 0);
		}
	}, [additionalTreatment, form]);

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updateAdditionalTreatment(values).then(() => {
				setIsOpen(false);
				router.refresh();
				form.reset();
			}),
			{
				loading: "Ek tedavi güncelleniyor...",
				success: "Ek tedavi güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Ek tedavi güncellenirken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					Düzenle
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Ek Tedavi Düzenle</DialogTitle>
					<DialogDescription>
						Mevcut ek tedavi bilgilerini düzenleyebilirsiniz.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tedavi Adı</FormLabel>
									<FormControl>
										<Input placeholder="Örn: Diş Beyazlatma" {...field} />
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
									<FormLabel>Açıklama (Opsiyonel)</FormLabel>
									<FormControl>
										<Textarea placeholder="Tedavi ile ilgili açıklama..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="defaultPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Varsayılan Fiyat</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center justify-end gap-3 pt-4">
							<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
								İptal
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Güncelleniyor..." : "Güncelle"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}