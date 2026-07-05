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

type PageProps = {
	data: RouterOutputs["admin"]["dentist"]["getAll"][number];
};

export default function DeleteDentist({ data }: PageProps) {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync: deleteDentist, isPending } = api.admin.dentist.delete.useMutation();

	const handleDelete = () => {
		toast.promise(
			deleteDentist({ id: data.id }).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Diş hekimi siliniyor...",
				success: "Diş hekimi silindi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Diş hekimi silinirken bir hata oluştu</p>
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
						Sil<Badge variant="destructive">{data.user.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Bu işlem ile "{data.user.name}" isimli diş hekiminin tüm bilgilerini silmek üzeresiniz. Bu işlem geri
						alınamaz. Yine de devam etmek istiyor musunuz?
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
