"use client";

import { useDataTable } from "@/hooks/use-data-table";
import type { RouterOutputs } from "@/trpc/react";

import { DataTable } from "@/components/data-table";
import { DataTableSortList } from "@/components/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table-toolbar";

import columns from "./columns";

type PageProps = {
	data: RouterOutputs["admin"]["additionalTreatment"]["getAll"];
};

export default function Table({ data }: PageProps) {
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
			<DataTableToolbar table={table} />
			<DataTable table={table} />
			<DataTableSortList table={table} />
		</div>
	);
}