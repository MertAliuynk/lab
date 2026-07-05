import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Brackets, Minus, MoreHorizontal } from "lucide-react";
import DeleteProsthesisType from "./actions/delete";
import EditProsthesisType from "./actions/edit";

type Item = RouterOutputs["admin"]["prosthesisType"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "Protez Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Brackets size={16} className="text-muted-foreground" />
				{row.original.name}
			</div>
		),
		meta: {
			label: "Protez Adı",
			variant: "text",
			placeholder: "Protez Adı'na göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "pricingType",
		accessorKey: "pricingType",
		header: "Fiyatlandırma Tipi",
		cell: ({ row }) => {
			const type = row.original.pricingType || "TOOTH_BASED";
			return (
				<Badge variant={type === "TOOTH_BASED" ? "default" : "secondary"}>
					{type === "TOOTH_BASED" ? "Diş Bazlı" : "Çene Bazlı"}
				</Badge>
			);
		},
		meta: { label: "Fiyatlandırma Tipi" },
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
							<EditProsthesisType data={row.original} />
							<DeleteProsthesisType data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
