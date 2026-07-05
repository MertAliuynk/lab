"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Kullanıcı adı en az 2 karakter olmalıdır.",
	}),
});

export default function Page() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		console.log(values);
	};

	return (
		<div>
			<Link href="/giris-yap">
				<div className="absolute left-2 top-4">
					<div className="flex items-center">
						<ChevronLeft size={24} />
						<p className="text-xs">Geri</p>
					</div>
				</div>
			</Link>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Kullanıcı Adı</FormLabel>
								<FormControl>
									<Input placeholder="Kullanıcı adı" {...field} />
								</FormControl>
								<FormDescription>
									Lütfen şifresini sıfırlamak istediğiniz hesabın kullanıcı adını giriniz.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full">
						Şifremi Sıfırla
					</Button>
				</form>
			</Form>
		</div>
	);
}
