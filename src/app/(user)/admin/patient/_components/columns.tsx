import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, FileText, Minus, MoreHorizontal, User2 } from "lucide-react";
import Link from "next/link";
import DeletePatient from "./actions/delete";
import EditPatient from "./actions/edit";

type Item = RouterOutputs["admin"]["patient"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "İsim Soyisim",
		cell: ({ row }) => (
			<Link
				href={`/admin/patient/${row.original.id}`}
				className="flex items-center gap-2 hover:underline text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				tabIndex={0}
				aria-label="Hasta detayına git"
			>
				<User2 size={16} className="text-muted-foreground" />
				{row.original.name}
			</Link>
		),
		meta: {
			label: "İsim Soyisim",
			variant: "text",
			placeholder: "İsim Soyisim'a göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "dentist",
		accessorKey: "dentist.user.name",
		header: "Diş Hekimi",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<User2 size={16} className="text-muted-foreground" />
				{row.original.dentist?.user.name || <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: { label: "Diş Hekimi" },
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
		id: "notes",
		accessorKey: "notes",
		header: "Notlar",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<FileText size={16} className="text-muted-foreground" />
				{row.original.notes ? (
					<span className="max-w-[200px] truncate">{row.original.notes}</span>
				) : (
					<Minus className="text-muted-foreground" />
				)}
			</div>
		),
		meta: { label: "Notlar" },
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
							<EditPatient data={row.original} />
							<DeletePatient data={row.original} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
