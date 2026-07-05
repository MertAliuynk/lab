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

type PageProps = { data: RouterOutputs["admin"]["prosthesisStage"]["getAll"][number] };

export default function DeleteProsthesisStage({ data }: PageProps) {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { mutateAsync: deleteProsthesisStage, isPending } = api.admin.prosthesisStage.delete.useMutation();

	const handleDelete = () => {
		toast.promise(
			deleteProsthesisStage({ id: data.id }).then(() => {
				router.refresh();
				setIsOpen(false);
			}),
			{
				loading: "Siliniyor...",
				success: "Silindi",
				error: (err) => (
					<div className="space-y-2">
						<p className="font-medium">Silinirken bir hata oluştu</p>
						{err.message && <code className="text-red-500 bg-red-50 p-2 rounded-md">{err.message}</code>}
					</div>
				),
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem variant="destructive" modal>
					Sil
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Sil <Badge>{data.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Bu işlem geri alınamaz. Bu işlem sonrasında protez aşamasının tüm verileri silinecektir.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="grid grid-cols-[1fr_2fr] gap-2">
					<Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)}>
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
