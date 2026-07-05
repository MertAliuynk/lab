"use client";
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
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = { id: string };

export default function DeleteExpenseType({ id }: Props) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync: deleteExpenseType, isPending } = api.admin.expenseType.delete.useMutation();
	const handleDelete = () => {
		toast.promise(
			deleteExpenseType({ id }).then(() => {
				setIsOpen(false);
				router.refresh();
			}),
			{
				loading: "Siliniyor...",
				success: "Gider türü silindi",
				error: (err) => err.message,
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Gider türünü silmek istediğinize emin misiniz?</DialogTitle>
					<DialogDescription>Gider türünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={isPending}>
						İptal
					</Button>
					<Button variant="destructive" type="button" onClick={handleDelete} loading={isPending}>
						Evet, Sil
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
