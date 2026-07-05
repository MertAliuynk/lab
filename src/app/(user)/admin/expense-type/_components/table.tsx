"use client";
import { DataTable } from "@/components/data-table";
import { DataTableSortList } from "@/components/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import columns from "./columns";

type ExpenseType = {
	id: string;
	name: string;
};

type Props = {
	data: ExpenseType[];
};

export default function Table({ data }: Props) {
	const { table } = useDataTable({
		data,
		columns,
		pageCount: 1,
		initialState: {
			pagination: { pageIndex: 0, pageSize: 10 },
			columnPinning: { right: ["actions"] },
		},
		getRowId: (row) => row.id,
		shallow: false,
	});
	return (
		<div>
			<DataTable table={table}>
				<DataTableToolbar table={table}>
					<DataTableSortList table={table} />
				</DataTableToolbar>
			</DataTable>
		</div>
	);
}
