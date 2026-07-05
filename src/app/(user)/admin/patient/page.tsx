import DashboardHeader from "@/components/dashboard-header";
import { api } from "@/trpc/server";
import NewPatient from "./_components/actions/new";
import Table from "./_components/table";

type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ searchParams }: PageProps) {
	const { page, perPage, name, sort } = await searchParams;
	const parsedSort = sort ? (JSON.parse(String(sort)) as Array<{ id: string; desc: boolean }>) : undefined;

	const data = await api.admin.patient.getAll({
		page: page ? Number(page) : undefined,
		perPage: perPage ? Number(perPage) : undefined,
		name: name ? String(name) : undefined,
		sort: parsedSort,
	});

	return (
		<div className="space-y-4">
			<DashboardHeader title="Hasta Listesi" rightContent={<NewPatient />} />
			<Table data={data} />
		</div>
	);
}
