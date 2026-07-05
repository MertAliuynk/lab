import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Layers, Minus, MoreHorizontal } from "lucide-react";
import DeleteProsthesisStage from "./actions/delete";
import EditProsthesisStage from "./actions/edit";

type Item = RouterOutputs["admin"]["prosthesisStage"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "Aşama Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Layers size={16} className="text-muted-foreground" />
				{row.original.name}
			</div>
		),
		meta: {
			label: "Aşama Adı",
			variant: "text",
			placeholder: "Aşama adına göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "description",
		accessorKey: "description",
		header: "Açıklama",
		cell: ({ row }) =>
			row.original.description ? row.original.description : <Minus className="text-muted-foreground" />,
		meta: { label: "Açıklama" },
	},
	{
		id: "percentage",
		accessorKey: "percentage",
		header: "Yüzde",
		cell: ({ row }) => (
			<div>
				<span className="font-medium">{row.original.percentage}%</span>
			</div>
		),
		meta: { label: "Yüzde" },
	},
	{
		id: "price",
		accessorKey: "price",
		header: "Fiyat",
		cell: ({ row }) => (
			<div className="flex items-center gap-1">
				{row.original.price !== null && row.original.price !== undefined ? (
					<span className="font-medium">{row.original.price} ₺</span>
				) : (
					<Minus className="text-muted-foreground" />
				)}
			</div>
		),
		meta: { label: "Fiyat" },
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<div className="flex items-center justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<EditProsthesisStage data={row.original} />
							<DeleteProsthesisStage data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
