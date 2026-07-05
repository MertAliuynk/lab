import ResetPassword from "@/components/reset-password";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Mail, Minus, MoreHorizontal, Phone, User2 } from "lucide-react";
import DeleteDentist from "./actions/delete";
import EditDentist from "./actions/edit";

type Item = RouterOutputs["admin"]["dentist"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "user.name",
		header: "İsim Soyisim",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<User2 size={16} className="text-muted-foreground" />
				{row.original.user.name}
			</div>
		),
		meta: {
			label: "İsim Soyisim",
			variant: "text",
			placeholder: "İsim Soyisim'a göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "title",
		accessorKey: "title",
		header: "Ünvan",
		cell: ({ row }) => (row.original.title ? row.original.title : <Minus className="text-muted-foreground" />),
		meta: { label: "Ünvan" },
	},
	{
		id: "email",
		accessorKey: "user.email",
		header: "E-posta",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Mail size={16} className="text-muted-foreground" />
				{row.original.user.email || <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "E-posta" },
	},
	{
		id: "phone",
		accessorKey: "user.phone",
		header: "Telefon",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Phone size={16} className="text-muted-foreground" />
				{row.original.user.phone || <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "Telefon" },
	},
	{
		id: "clinic",
		accessorKey: "clinic.name",
		header: "Klinik",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Building2 size={16} className="text-muted-foreground" />
				{row.original.clinic ? row.original.clinic.name : <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "Klinik" },
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
							<EditDentist data={row.original} />
							<ResetPassword userId={row.original.user.id} userName={row.original.user.name} />
							<DeleteDentist data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
