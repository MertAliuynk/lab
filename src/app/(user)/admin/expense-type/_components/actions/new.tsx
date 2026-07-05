"use client";
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
import { createSchema } from "@/server/api/routers/admin/expense-type/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewExpenseType() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync: createExpenseType, isPending } = api.admin.expenseType.create.useMutation();
	const form = useForm({
		resolver: zodResolver(createSchema),
		defaultValues: { name: "" },
	});
	const onSubmit = (values: { name: string }) => {
		toast.promise(
			createExpenseType(values).then(() => {
				setIsOpen(false);
				form.reset();
				router.refresh();
			}),
			{
				loading: "Gider türü ekleniyor...",
				success: "Gider türü eklendi",
				error: (err) => err.message,
			},
		);
	};
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="blue">
					<Plus />
					Yeni Gider Türü
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Yeni <Badge variant="blue">Gider Türü</Badge>
					</DialogTitle>
					<DialogDescription>Yeni bir gider türü eklemek için formu doldurun.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Gider Türü Adı</FormLabel>
									<FormControl>
										<Input placeholder="Gider türü adı giriniz" {...field} />
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
