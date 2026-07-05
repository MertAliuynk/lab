import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Heart, Minus, MoreHorizontal } from "lucide-react";
import DeleteAdditionalTreatment from "./actions/delete";
import EditAdditionalTreatment from "./actions/edit";

type Item = RouterOutputs["admin"]["additionalTreatment"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "Tedavi Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Heart size={16} className="text-muted-foreground" />
				{row.original.name}
			</div>
		),
		meta: {
			label: "Tedavi Adı",
			variant: "text",
			placeholder: "Tedavi Adı'na göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "description",
		accessorKey: "description",
		header: "Açıklama",
		cell: ({ row }) => row.original.description || <Minus size={16} className="text-muted-foreground" />,
		meta: { label: "Açıklama" },
	},
	{
		id: "defaultPrice",
		accessorKey: "defaultPrice",
		header: "Varsayılan Fiyat",
		cell: ({ row }) => formatCurrency(Number(row.original.defaultPrice)),
		meta: {
			label: "Varsayılan Fiyat",
		},
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Menüyü aç</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="p-0 border-0">
					<EditAdditionalTreatment additionalTreatment={row.original} />
					<DeleteAdditionalTreatment additionalTreatment={row.original} />
				</DropdownMenuContent>
			</DropdownMenu>
		),
		meta: {
			label: "İşlemler",
		},
	},
] as ColumnDef<Item>[];