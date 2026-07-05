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
import { PhoneInput } from "@/components/ui/phone-input";
import { updateSchema } from "@/server/api/routers/admin/clinic-manager/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ClinicWithManager = RouterOutputs["admin"]["clinicManager"]["getAll"][number];

interface EditClinicManagerProps {
	data: ClinicWithManager;
}

export default function EditClinicManager({ data }: EditClinicManagerProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updateClinicManager, isPending } = api.admin.clinicManager.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: data.user.id,
			name: data.user.name,
			username: data.user.username || "",
			email: data.user.email || "",
			phone: data.user.phone || "",
		},
	});

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updateClinicManager(values).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Klinik yöneticisi güncelleniyor...",
				success: "Klinik yöneticisi güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Klinik yöneticisi güncellenirken bir hata oluştu</p>
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
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Düzenle <Badge variant="green">{data.user.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Klinik yöneticisi bilgilerini güncellemek için aşağıdaki formu doldurun ve <Badge>Güncelle</Badge> butonuna
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
