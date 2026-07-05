import ResetPassword from "@/components/reset-password";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { RouterOutputs } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { AtSign, IdCard, Mail, Minus, MoreHorizontal, Phone } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import DeleteLaboratoryTechnician from "./actions/delete";
import EditLaboratoryTechnician from "./actions/edit";

type Item = RouterOutputs["admin"]["laboratoryTechnician"]["getAll"][number];

export default [
	{
		id: "name",
		accessorKey: "name",
		header: "İsim Soyisim",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<IdCard size={16} className="text-muted-foreground" />
				{row.original.user.name}
			</div>
		),
		meta: {
			label: "İsim Soyisim",
			variant: "text",
			placeholder: "İsim Soyisim'e göre arayın...",
		},
		enableColumnFilter: true,
	},
	{
		id: "username",
		accessorKey: "username",
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
		id: "phone",
		accessorKey: "phone",
		header: "Telefon Numarası",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Phone size={16} className="text-muted-foreground" />
				{row.original.user.phone ? (
					formatPhoneNumberIntl(row.original.user.phone)
				) : (
					<Minus className="text-muted-foreground" />
				)}
			</div>
		),
		meta: {
			label: "Telefon Numarası",
		},
	},
	{
		id: "email",
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Mail size={16} className="text-muted-foreground" />
				{row.original.user.email ? row.original.user.email : <Minus className="text-muted-foreground" />}
			</div>
		),
		meta: {
			label: "Email",
		},
	},
	{
		id: "specialization",
		accessorKey: "specialization",
		header: "Uzmanlık Alanı",
		cell: ({ row }) =>
			row.original.specialization ? row.original.specialization : <Minus className="text-muted-foreground" />,
		meta: { label: "Uzmanlık Alanı" },
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
							<EditLaboratoryTechnician data={row.original} />
							<ResetPassword userId={row.original.user.id} userName={row.original.user.name} />
							<DeleteLaboratoryTechnician user={row.original.user} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 32,
	},
] as ColumnDef<Item>[];
