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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateSchema } from "@/server/api/routers/admin/expense-type/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	data: { id: string; name: string };
};

export default function EditExpenseType({ data }: Props) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync: updateExpenseType, isPending } = api.admin.expenseType.update.useMutation();
	const form = useForm({
		resolver: zodResolver(updateSchema),
		defaultValues: { id: data.id, name: data.name },
	});
	const onSubmit = (values: { id: string; name: string }) => {
		toast.promise(
			updateExpenseType(values).then(() => {
				setIsOpen(false);
				form.reset(values);
				router.refresh();
			}),
			{
				loading: "Gider türü güncelleniyor...",
				success: "Gider türü güncellendi",
				error: (err) => err.message,
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
						Gider Türü <Badge variant="blue">Düzenle</Badge>
					</DialogTitle>
					<DialogDescription>Gider türü adını güncelleyin.</DialogDescription>
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
