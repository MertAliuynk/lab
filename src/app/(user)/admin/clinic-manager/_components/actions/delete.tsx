"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type RouterOutputs, api } from "@/trpc/react";
type ClinicWithManager = RouterOutputs["admin"]["clinicManager"]["getAll"][number];

interface DeleteProps {
	data: ClinicWithManager;
}

export default function Delete({ data }: DeleteProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: deleteClinicManager, isPending } = api.admin.clinicManager.delete.useMutation();

	const handleDelete = async () => {
		toast.promise(
			deleteClinicManager({ id: data.user.id }).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Klinik yöneticisi siliniyor...",
				success: "Klinik yöneticisi silindi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Klinik yöneticisi silinirken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem modal variant="destructive">
					Sil
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Sil <Badge variant="destructive">{data.user.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						<span className="font-semibold">{data.user.name}</span> isimli klinik yöneticisini silmek istediğinize emin
						misiniz? Bu işlem geri alınamaz.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="grid grid-cols-[1fr_2fr] gap-2">
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						İptal
					</Button>
					<Button variant="destructive" onClick={handleDelete} disabled={isPending} loading={isPending}>
						Sil
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
