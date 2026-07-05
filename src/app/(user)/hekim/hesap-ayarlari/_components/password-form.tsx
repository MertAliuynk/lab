"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordFormSchema = z
	.object({
		currentPassword: z.string().min(6, "Mevcut şifre en az 6 karakter olmalıdır"),
		newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
		confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Şifreler eşleşmiyor",
		path: ["confirmPassword"],
	});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordForm() {
	const updatePassword = api.user.updatePassword.useMutation({
		onSuccess: () => {
			toast.success("Şifreniz başarıyla güncellendi");
			form.reset();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = (data: PasswordFormValues) => {
		updatePassword.mutate(data);
	};

	return (
		<Card className="border-0 shadow-lg">
			<CardHeader>
				<CardTitle>Şifre Değiştir</CardTitle>
				<CardDescription>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mevcut Şifre</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Mevcut şifreniz" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Yeni Şifre</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Yeni şifreniz" {...field} />
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
									<FormLabel>Yeni Şifre Tekrar</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Yeni şifrenizi tekrar girin" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={updatePassword.isPending}>
							{updatePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Şifreyi Güncelle
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
