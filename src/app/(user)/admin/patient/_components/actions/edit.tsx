"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { SelectDentist } from "@/components/select-dentist";
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
import { updateSchema } from "@/server/api/routers/admin/patient/schema";
import { type RouterOutputs, api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type PatientWithDetails = RouterOutputs["admin"]["patient"]["getAll"][number];

interface EditPatientProps {
	data: PatientWithDetails;
}

export default function EditPatient({ data }: EditPatientProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: updatePatient, isPending } = api.admin.patient.update.useMutation();

	const form = useForm<z.infer<typeof updateSchema>>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			id: data.id,
			name: data.name,
			notes: data.notes || "",
			dentistId: data.dentist?.id,
		},
	});

	const onSubmit = (values: z.infer<typeof updateSchema>) => {
		toast.promise(
			updatePatient(values).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Hasta güncelleniyor...",
				success: "Hasta güncellendi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Hasta güncellenirken bir hata oluştu</p>
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
						<Badge variant="blue">{data.name}</Badge> Hastasını Düzenle
					</DialogTitle>
					<DialogDescription>
						Hasta bilgilerini güncellemek için aşağıdaki formu doldurun ve <Badge>Güncelle</Badge> butonuna tıklayın
						veya işlemi iptal etmek isterseniz <Badge variant="outline">İptal</Badge> butonuna tıklayarak işlemi iptal
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
									<FormLabel required>İsim Soyisim</FormLabel>
									<FormControl>
										<Input placeholder="Hasta adı soyadı giriniz" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dentistId"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Diş Hekimi</FormLabel>
									<SelectDentist {...field} />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notlar</FormLabel>
									<FormControl>
										<Textarea placeholder="Hasta hakkında notlar..." {...field} />
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
