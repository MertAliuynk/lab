import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { AtSign, Building2, Minus, MoreHorizontal, User2 } from "lucide-react";
import DeleteClinicManager from "./actions/delete";
import EditClinicManager from "./actions/edit";

type Item = RouterOutputs["admin"]["clinicManager"]["getAll"][number];

export default [
	{
		id: "user.name",
		accessorKey: "user.name",
		header: "Yönetici Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<User2 size={16} className="text-muted-foreground" />
				{row.original.user.name || <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: {
			label: "Yönetici Adı",
			variant: "text",
			placeholder: "Yönetici Adı'na göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "user.username",
		accessorKey: "user.username",
		header: "Kullanıcı Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-1">
				<AtSign size={16} className="text-muted-foreground" />
				{row.original.user.username}
			</div>
		),
		meta: {
			label: "Kullanıcı Adı",
		},
	},
	{
		id: "clinic.name",
		accessorKey: "clinic.name",
		header: "Klinik Adı",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Building2 size={16} className="text-muted-foreground" />
				{row.original.clinic.name}
			</div>
		),
		meta: { label: "Klinik Adı" },
	},
	{
		id: "clinic.address",
		accessorKey: "clinic.address",
		header: "Klinik Adresi",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				{row.original.clinic.address || <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "Klinik Adresi" },
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
							<EditClinicManager data={row.original} />
							<DeleteClinicManager data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
