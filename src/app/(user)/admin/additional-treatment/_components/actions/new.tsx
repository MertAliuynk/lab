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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSchema } from "@/server/api/routers/admin/additional-treatment/schema";
import { api } from "@/trpc/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewAdditionalTreatment() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: createNewAdditionalTreatment, isPending } = api.admin.additionalTreatment.create.useMutation();

	const form = useForm<z.infer<typeof createSchema>>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			name: "",
			description: "",
			defaultPrice: 0,
		},
	});

	const onSubmit = (values: z.infer<typeof createSchema>) => {
		toast.promise(
			createNewAdditionalTreatment(values).then(() => {
				setIsOpen(false);
				form.reset();
				router.refresh();
			}),
			{
				loading: "Ek tedavi ekleniyor...",
				success: "Ek tedavi başarıyla eklendi!",
				error: (error) => {
					return error.message;
				},
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="flex items-center gap-2">
					<Heart size={16} />
					Yeni Ek Tedavi
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Heart size={20} />
						Yeni Ek Tedavi Ekle
					</DialogTitle>
					<DialogDescription>
						Yeni bir ek tedavi türü ekleyebilirsiniz. Bu tedavi türü sistemde kullanılabilir hale gelecektir.
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
								{isPending ? "Ekleniyor..." : "Ek Tedavi Ekle"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}