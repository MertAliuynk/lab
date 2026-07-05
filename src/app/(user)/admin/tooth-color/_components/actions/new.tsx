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
import { Textarea } from "@/components/ui/textarea";
import { createSchema } from "@/server/api/routers/admin/tooth-color/schema";
import { api } from "@/trpc/react";
import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewToothColor() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: createNewToothColor, isPending } = api.admin.toothColor.create.useMutation();

	const form = useForm<z.infer<typeof createSchema>>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = (values: z.infer<typeof createSchema>) => {
		toast.promise(
			createNewToothColor(values).then(() => {
				setIsOpen(false);
				form.reset();
				router.refresh();
			}),
			{
				loading: "Yeni renk oluşturuluyor...",
				success: "Yeni renk oluşturuldu",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Yeni renk oluşturulurken bir hata oluştu</p>
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
					<Palette />
					Yeni Renk Ekle
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Yeni <Badge variant="blue">Diş Rengi</Badge>
					</DialogTitle>
					<DialogDescription>
						Yeni bir diş rengi eklemek için aşağıdaki formu doldurun ve <Badge>Kaydet</Badge> butonuna tıklayın veya
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
									<FormLabel required>Renk Adı</FormLabel>
									<FormControl>
										<Input placeholder="A1, A2, B1 vb." {...field} />
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
								Kaydet
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
