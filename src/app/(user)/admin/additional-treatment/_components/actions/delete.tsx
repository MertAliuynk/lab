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

type PageProps = { additionalTreatment: RouterOutputs["admin"]["additionalTreatment"]["getAll"][number] };

export default function DeleteAdditionalTreatment({ additionalTreatment }: PageProps) {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { mutateAsync: deleteAdditionalTreatment, isPending } = api.admin.additionalTreatment.delete.useMutation();

	const handleDelete = () => {
		toast.promise(
			deleteAdditionalTreatment({ id: additionalTreatment.id }).then(() => {
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
				<DropdownMenuItem 
					className="text-red-600 focus:text-red-600" 
					onSelect={(e) => e.preventDefault()}
				>
					Sil
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Sil <Badge>{additionalTreatment.name}</Badge>
					</DialogTitle>
					<DialogDescription>
						Bu işlem geri alınamaz. Bu işlem sonrasında ek tedavinin tüm verileri silinecektir.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						İptal
					</Button>
					<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
						{isPending ? "Siliniyor..." : "Sil"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}