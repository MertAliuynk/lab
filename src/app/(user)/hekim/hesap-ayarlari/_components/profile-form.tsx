"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const accountFormSchema = z.object({
	name: z.string().min(3, "İsim en az 3 karakter olmalıdır"),
	username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface ProfileFormProps {
	user: Pick<User, "name" | "username">;
}

export function ProfileForm({ user }: ProfileFormProps) {
	const updateUser = api.user.update.useMutation({
		onSuccess: () => {
			toast.success(
				"Bilgileriniz başarıyla güncellendi. Bilgilerinizin güncellenmesi için çıkış yapıp tekrar giriş yapınız.",
			);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			name: "",
			username: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				username: user.username,
			});
		}
	}, [user, form]);

	const handleSubmit = (data: AccountFormValues) => {
		updateUser.mutate(data);
	};

	return (
		<Card className="border-0 shadow-lg">
			<CardHeader>
				<CardTitle>Profil Bilgileri</CardTitle>
				<CardDescription>Kişisel bilgilerinizi buradan güncelleyebilirsiniz</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>İsim Soyisim</FormLabel>
									<FormControl>
										<Input placeholder="İsim Soyisim" {...field} />
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
									<FormLabel>Kullanıcı Adı</FormLabel>
									<FormControl>
										<Input placeholder="Kullanıcı adı" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={updateUser.isPending}>
							{updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Bilgileri Güncelle
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
