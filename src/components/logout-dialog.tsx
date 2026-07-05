"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";

interface LogoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
	const handleLogout = async () => {
		await signOut({
			callbackUrl: "/login",
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Çıkış Yapmak İstediğinizden Emin misiniz?</AlertDialogTitle>
					<AlertDialogDescription>
						Bu işlem sizi sistemden çıkaracak ve giriş sayfasına yönlendirecektir.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>İptal</AlertDialogCancel>
					<AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
						Evet, Çıkış Yap
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
