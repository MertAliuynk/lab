import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import DeleteExpenseType from "./actions/delete";
import EditExpenseType from "./actions/edit";

type ExpenseType = {
	id: string;
	name: string;
};

const columns: ColumnDef<ExpenseType>[] = [
	{
		accessorKey: "name",
		header: "Gider Türü Adı",
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<div className="flex items-center justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">Menüyü Aç</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<EditExpenseType data={row.original} />
						<DeleteExpenseType id={row.original.id} />
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
		size: 32,
	},
];

export default columns;
