import { PatientListContainer } from "./_components/patient-list-container";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
	return (
		<div className="space-y-6">
			<PatientListContainer />
		</div>
	);
}
