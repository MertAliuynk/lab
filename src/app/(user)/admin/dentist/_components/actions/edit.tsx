"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { SelectClinic } from "@/components/select-clinic";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { updateSchema } from "@/server/api/routers/admin/dentist/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DentistWithDetails = RouterOutputs["admin"]["dentist"]["getAll"][number];

interface EditDentistProps {
	data: DentistWithDetails;
}

export default function EditDentist({ data }: EditDentistProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updateDentist, isPending } = api.admin.dentist.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: data.id,
			name: data.user.name,
			username: data.user.username,
			email: data.user.email || "",
			phone: data.user.phone || "",
			title: data.title || "",
			clinicId: data.clinic?.id,
		},
	});

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updateDentist(values).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Diş hekimi güncelleniyor...",
				success: "Diş hekimi güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Diş hekimi güncellenirken bir hata oluştu</p>
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
						Düzenle <Badge variant="green">{data.user.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Diş hekimi bilgilerini güncellemek için aşağıdaki formu doldurun ve <Badge>Güncelle</Badge> butonuna
						tıklayın veya işlemi iptal etmek isterseniz <Badge variant="outline">İptal</Badge> butonuna tıklayarak
						işlemi iptal edebilirsiniz.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>İsim Soyisim</FormLabel>
									<FormControl>
										<Input placeholder="İsim Soyisim giriniz" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ünvan</FormLabel>
									<FormControl>
										<Input placeholder="Ünvan giriniz" {...field} />
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
										<SelectClinic {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Kullanıcı Adı</FormLabel>
									<FormControl>
										<Input placeholder="Kullanıcı adı giriniz" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-posta</FormLabel>
										<FormControl>
											<Input type="email" placeholder="E-posta adresi giriniz" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telefon</FormLabel>
										<FormControl>
											<PhoneInput {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

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
