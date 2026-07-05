"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Kullanıcı adı en az 2 karakter olmalıdır.",
	}),
	password: z.string().min(5, {
		message: "Şifreniz en az 5 karakter olmalıdır.",
	}),
});

export default function LoginForm() {
	const router = useRouter();

	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsError(false);
		setIsLoading(true);
		const result = await signIn("credentials", {
			username: values.username,
			password: values.password,
			redirect: false,
		});

		setIsLoading(false);

		if (result?.error) {
			setIsError(true);
			return;
		}

		router.refresh();
	}

	return (
		<Form {...form}>
			{isError && (
				<Alert>
					<AlertTitle>Başarısız!</AlertTitle>
					<AlertDescription>Kullanıcı adı veya şifre hatalı.</AlertDescription>
				</Alert>
			)}
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Kullanıcı Adı</FormLabel>
							<FormControl>
								<Input prefix={<User size={16} />} placeholder="Kullanıcı Adı" {...field} />
							</FormControl>
							<FormDescription>Şirket tarafından tanımlanmış kullanıcı adını giriniz.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Şifreniz</FormLabel>
							<FormControl>
								<Input type="password" prefix={<Lock size={16} />} placeholder="Şifreniz" {...field} />
							</FormControl>
							<FormDescription>Şifrenizi giriniz.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					<div className="flex gap-2" />
					<Link href="/forget-password">
						<div className="text-sm">Şifrenizi mi unuttunuz?</div>
					</Link>
				</div>
				<Button type="submit" className="w-full" loading={isLoading}>
					Giriş Yap
				</Button>
			</form>
		</Form>
	);
}
