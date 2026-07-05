import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Minus, MoreHorizontal, Palette } from "lucide-react";

import DeleteToothColor from "./actions/delete";
import EditToothColor from "./actions/edit";

type Item = RouterOutputs["admin"]["toothColor"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "Renk Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Palette size={16} className="text-muted-foreground" />
				{row.original.name}
			</div>
		),
		meta: {
			label: "Renk Adı",
			variant: "text",
			placeholder: "Renk Adı'na göre arayın...",
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
							<EditToothColor data={row.original} />
							<DeleteToothColor data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
