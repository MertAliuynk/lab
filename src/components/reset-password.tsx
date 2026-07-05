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
import { resetPasswordSchema } from "@/server/api/routers/admin/user/schema";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export default function ResetPassword({ userId, userName }: { userId: string; userName: string }) {
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: resetPassword, isPending } = api.admin.user.resetPassword.useMutation();

	const form = useForm<z.infer<typeof resetPasswordSchema>>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			userId,
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
		toast.promise(
			resetPassword(values).then(() => {
				setIsOpen(false);
				form.reset();
			}),
			{
				loading: "Şifre sıfırlanıyor...",
				success: "Şifre sıfırlandı",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Şifre sıfırlanırken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem modal>Şifreyi Sıfırla</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Şifre Sıfırla
						<Badge>{userName}</Badge>
					</DialogTitle>
					<DialogDescription className="sr-only">
						{`${userName} adlı kullanıcının şifresini sıfırlamak istediğinize emin misiniz?`}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Şifre</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Şifre" {...field} />
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
									<FormLabel>Şifre Tekrarı</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Şifre Tekrarı" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-[1fr_2fr] gap-2">
							<Button type="button" variant="outline" disabled={isPending} onClick={() => setIsOpen(false)}>
								İptal
							</Button>
							<Button type="submit" loading={isPending}>
								Şifreyi Sıfırla
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
