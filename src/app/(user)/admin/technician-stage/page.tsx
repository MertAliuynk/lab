import DashboardHeader from "@/components/dashboard-header";
import { api } from "@/trpc/server";
import NewTechnicianStage from "./_components/actions/new";
import Table from "./_components/table";

type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ searchParams }: PageProps) {
	const { page, perPage, name, sort } = await searchParams;

	const parsedSort = sort ? (JSON.parse(String(sort)) as Array<{ id: string; desc: boolean }>) : undefined;

	const technicianStages = await api.admin.technicianStage.getAll({
		page: page ? Number(page) : undefined,
		perPage: perPage ? Number(perPage) : undefined,
		name: name ? String(name) : undefined,
		sort: parsedSort,
	});

	return (
		<div className="space-y-5">
			<DashboardHeader title="Teknisyen Aşaması Listesi" rightContent={<NewTechnicianStage />} />
			<Table data={technicianStages} />
		</div>
	);
}