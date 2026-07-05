"use client";

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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ClinicWithManager = RouterOutputs["admin"]["clinic"]["getAll"][number];

interface DeleteClinicProps {
	data: ClinicWithManager;
}

export default function DeleteClinic({ data }: DeleteClinicProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync: deleteClinic, isPending } = api.admin.clinic.delete.useMutation();

	const handleDelete = () => {
		toast.promise(
			deleteClinic({ id: data.id }).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Klinik siliniyor...",
				success: "Klinik silindi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Klinik silinirken bir hata oluştu</p>
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
						Sil<Badge variant="destructive">{data.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Bu işlem ile "{data.name}" isimli kliniğin tüm bilgilerini silmek üzeresiniz. Bu işlem geri alınamaz. Yine
						de devam etmek istiyor musunuz?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="grid grid-cols-[1fr_2fr] gap-2">
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						İptal
					</Button>
					<Button variant="destructive" loading={isPending} onClick={handleDelete}>
						Sil
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
