import DashboardHeader from "@/components/dashboard-header";
import { api } from "@/trpc/server";
import NewExpenseType from "./_components/actions/new";
import Table from "./_components/table";

export default async function Page() {
	const expenseTypes = await api.admin.expenseType.getAll();
	return (
		<div className="space-y-5">
			<DashboardHeader title="Gider Türü Listesi" rightContent={<NewExpenseType />} />
			<Table data={expenseTypes} />
		</div>
	);
}
