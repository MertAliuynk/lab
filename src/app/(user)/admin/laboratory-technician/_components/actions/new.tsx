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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { createSchema } from "@/server/api/routers/admin/laboratory-technician/schema";
import { api } from "@/trpc/react";
import { UserRole } from "@prisma/client";
import { UserPlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewLaboratoryTechnician() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: createNewLaboratoryTechnician, isPending } = api.admin.laboratoryTechnician.create.useMutation();

	const form = useForm<z.infer<typeof createSchema>>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
			role: UserRole.LABORATORY_TECHNICIAN,
			name: "",
			email: "",
			phone: "",
			specialization: "",
		},
	});

	const onSubmit = (values: z.infer<typeof createSchema>) => {
		toast.promise(
			createNewLaboratoryTechnician(values).then(() => {
				setIsOpen(false);
				form.reset();
				router.refresh();
			}),
			{
				loading: "Yeni teknisyen oluşturuluyor...",
				success: "Yeni teknisyen oluşturuldu",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Yeni teknisyen oluşturulurken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="blue">
					<UserPlus2 />
					Yeni Teknisyen Ekle
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Yeni <Badge variant="blue">Laboratuvar Teknisyeni</Badge>
					</DialogTitle>
					<DialogDescription>
						Yeni bir laboratuvar teknisyeni eklemek için aşağıdaki formu doldurun ve <Badge>Kaydet</Badge> butonuna
						tıklayın veya işlemi iptal etmek isterseniz <Badge variant="outline">İptal</Badge> butonuna tıklayarak
						işlemi iptal edebilirsiniz.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Kullanıcı Adı</FormLabel>
									<FormControl>
										<Input placeholder="kullaniciadi" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Şifre</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Şifre Tekrar</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>İsim Soyisim</FormLabel>
									<FormControl>
										<Input placeholder="İsim Soyisim" {...field} />
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
										<Input type="email" placeholder="ornek@email.com" {...field} />
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
										<PhoneInput className="w-full" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="specialization"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Uzmanlık Alanı</FormLabel>
									<FormControl>
										<Input placeholder="Uzmanlık Alanı" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-[1fr_2fr] gap-2">
							<Button variant="outline" type="button">
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
