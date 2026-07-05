import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Minus, MoreHorizontal, User2, Users2 } from "lucide-react";
import DeleteClinic from "./actions/delete";
import EditClinic from "./actions/edit";
import UpdateClinicPrices from "./actions/update-prices";

type Item = RouterOutputs["admin"]["clinic"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "Klinik Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Building2 size={16} className="text-muted-foreground" />
				{row.original.name}
			</div>
		),
		meta: {
			label: "Klinik Adı",
			variant: "text",
			placeholder: "Klinik Adı'na göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "address",
		accessorKey: "address",
		header: "Adres",
		cell: ({ row }) => (row.original.address ? row.original.address : <Minus className="text-muted-foreground" />),
		meta: { label: "Adres" },
	},
	{
		id: "manager",
		accessorKey: "manager",
		header: "Yönetici",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<User2 size={16} className="text-muted-foreground" />
				{row.original.manager ? row.original.manager.user.name : <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "Yönetici" },
	},
	{
		id: "dentists",
		accessorKey: "dentists",
		header: "Diş Hekimleri",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Users2 size={16} className="text-muted-foreground" />
				{row.original.dentists.length}
			</div>
		),
		meta: { label: "Diş Hekimleri" },
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
							<EditClinic data={row.original} />
							<UpdateClinicPrices clinicId={row.original.id} clinicName={row.original.name} />
							<DeleteClinic data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
